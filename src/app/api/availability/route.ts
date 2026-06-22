import { NextRequest, NextResponse } from "next/server";
import { checkKitAvailability, checkProductAvailability } from "@/lib/reservations";

/**
 * GET /api/availability?kitId=...&productId=...&start=ISO&end=ISO
 *
 * Returns { available: boolean, missing_items: string[] }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const kitId = searchParams.get("kitId");
  const productId = searchParams.get("productId");
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  if (!startParam || !endParam) {
    return NextResponse.json(
      { error: "Parâmetros 'start' e 'end' são obrigatórios." },
      { status: 400 }
    );
  }

  const start = new Date(startParam);
  const end = new Date(endParam);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: "Datas inválidas." }, { status: 400 });
  }

  if (end <= start) {
    return NextResponse.json(
      { error: "A data de fim deve ser posterior à data de início." },
      { status: 400 }
    );
  }

  try {
    let result;
    if (kitId) {
      result = await checkKitAvailability(kitId, start, end);
    } else if (productId) {
      result = await checkProductAvailability(productId, start, end);
    } else {
      return NextResponse.json(
        { error: "Informe 'kitId' ou 'productId'." },
        { status: 400 }
      );
    }
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao verificar disponibilidade";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
