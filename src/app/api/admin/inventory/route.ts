import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getAllItems,
  upsertItem,
  deleteItem,
  getAllKits,
  upsertKit,
  deleteKit,
} from "@/lib/reservations";

// GET /api/admin/inventory?type=items|kits
export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const type = req.nextUrl.searchParams.get("type") ?? "items";
  try {
    if (type === "kits") {
      return NextResponse.json(await getAllKits());
    }
    return NextResponse.json(await getAllItems());
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/admin/inventory  — body: { type: 'item'|'kit', ...fields }
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { type, ...fields } = body;
    if (type === "kit") {
      const id = await upsertKit(fields);
      return NextResponse.json({ ok: true, id });
    }
    const id = await upsertItem(fields);
    return NextResponse.json({ ok: true, id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/inventory  — body: { type: 'item'|'kit', id }
export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const { type, id } = await req.json();
    if (type === "kit") {
      await deleteKit(id);
    } else {
      await deleteItem(id);
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
