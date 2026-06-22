import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getAllReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation,
} from "@/lib/reservations";
import type { DbReservation } from "@/lib/supabase";

// GET — admin only: list all reservations
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const reservations = await getAllReservations();
    return NextResponse.json(reservations);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST — public: create a reservation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      client_name,
      client_cpf,
      client_phone,
      kit_id,
      product_id,
      event_start,
      event_end,
      notes,
    } = body;

    if (!client_name || !client_cpf || !event_start || !event_end) {
      return NextResponse.json(
        { error: "Campos obrigatórios: client_name, client_cpf, event_start, event_end" },
        { status: 400 }
      );
    }

    const result = await createReservation({
      client_name,
      client_cpf,
      client_phone,
      kit_id: kit_id ?? null,
      product_id: product_id ?? null,
      event_start: new Date(event_start),
      event_end: new Date(event_end),
      notes,
    });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH — admin only: update reservation status
export async function PATCH(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "id e status são obrigatórios" }, { status: 400 });
    }
    const validStatuses: DbReservation["status"][] = [
      "Pendente",
      "Confirmado",
      "Concluido",
      "Cancelado",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }
    await updateReservationStatus(id, status);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE — admin only
export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    await deleteReservation(id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
