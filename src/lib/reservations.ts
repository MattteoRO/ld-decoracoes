import { supabase } from "./supabase";
import type {
  DbItem,
  DbKit,
  DbReservation,
  AvailabilityResult,
} from "./supabase";

// ── Items (Acervo Físico) ─────────────────────────────────────

export async function getAllItems(): Promise<DbItem[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("category", { ascending: true })
    .order("sku", { ascending: true });
  if (error || !data) return [];
  return data as DbItem[];
}

export async function upsertItem(item: {
  id?: string;
  sku: string;
  name: string;
  category: string;
  is_available: boolean;
}): Promise<string> {
  const { id, ...fields } = item;
  if (id) {
    const { error } = await supabase.from("items").update(fields).eq("id", id);
    if (error) throw error;
    return id;
  }
  const { data, error } = await supabase
    .from("items")
    .insert(fields)
    .select("id")
    .single();
  if (error || !data) throw error;
  return (data as { id: string }).id;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;
}

// ── Kits ─────────────────────────────────────────────────────

export async function getAllKits(): Promise<DbKit[]> {
  const { data, error } = await supabase
    .from("kits")
    .select("*, kit_items(*)")
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data as DbKit[];
}

export async function getKitById(id: string): Promise<DbKit | null> {
  const { data, error } = await supabase
    .from("kits")
    .select("*, kit_items(*)")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as DbKit;
}

export async function upsertKit(kit: {
  id?: string;
  product_id?: string | null;
  name: string;
  description?: string;
  price?: number | null;
  active: boolean;
  kit_items: Array<{ category_needed?: string | null; specific_sku?: string | null; quantity: number }>;
}): Promise<string> {
  const { id, kit_items, ...fields } = kit;
  let kitId = id;

  if (kitId) {
    const { error } = await supabase.from("kits").update(fields).eq("id", kitId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("kits")
      .insert(fields)
      .select("id")
      .single();
    if (error || !data) throw error;
    kitId = (data as { id: string }).id;
  }

  // Replace kit_items
  await supabase.from("kit_items").delete().eq("kit_id", kitId);
  if (kit_items.length > 0) {
    const rows = kit_items.map((ki) => ({ ...ki, kit_id: kitId }));
    const { error } = await supabase.from("kit_items").insert(rows);
    if (error) throw error;
  }

  return kitId!;
}

export async function deleteKit(id: string): Promise<void> {
  await supabase.from("kit_items").delete().eq("kit_id", id);
  const { error } = await supabase.from("kits").delete().eq("id", id);
  if (error) throw error;
}

// ── Availability ──────────────────────────────────────────────

/**
 * Checks if a kit is available for the given period.
 * Calls the Supabase RPC function check_kit_availability.
 */
export async function checkKitAvailability(
  kitId: string,
  eventStart: Date,
  eventEnd: Date
): Promise<AvailabilityResult> {
  const { data, error } = await supabase.rpc("check_kit_availability", {
    p_kit_id: kitId,
    p_start: eventStart.toISOString(),
    p_end: eventEnd.toISOString(),
  });

  if (error) throw error;

  // RPC returns an array of rows (RETURNS TABLE)
  const row = Array.isArray(data) ? data[0] : data;
  return {
    available: row?.available ?? false,
    missing_items: row?.missing_items ?? [],
  };
}

/**
 * Checks availability for a product (non-kit) based on its linked kit,
 * or simply returns available=true if no kit is configured.
 */
export async function checkProductAvailability(
  productId: string,
  eventStart: Date,
  eventEnd: Date
): Promise<AvailabilityResult> {
  // Find if there's a kit linked to this product
  const { data: kits } = await supabase
    .from("kits")
    .select("id")
    .eq("product_id", productId)
    .eq("active", true)
    .limit(1);

  if (!kits || kits.length === 0) {
    // No kit mapping — cannot verify, return available with a note
    return { available: true, missing_items: [] };
  }

  return checkKitAvailability(kits[0].id, eventStart, eventEnd);
}

// ── Reservations ──────────────────────────────────────────────

export async function getAllReservations(): Promise<DbReservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, reservation_items(*, items(*)), kits(name)")
    .order("event_start", { ascending: false });
  if (error || !data) return [];
  return data as DbReservation[];
}

export async function getReservationById(id: string): Promise<DbReservation | null> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, reservation_items(*, items(*)), kits(name)")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as DbReservation;
}

export interface CreateReservationInput {
  client_name: string;
  client_cpf: string;
  client_phone?: string;
  kit_id?: string | null;
  product_id?: string | null;
  event_start: Date;
  event_end: Date;
  notes?: string;
}

/**
 * Creates a reservation and allocates SKUs atomically.
 * Throws if the kit is no longer available (race condition protection).
 */
export async function createReservation(
  input: CreateReservationInput
): Promise<{ id: string }> {
  // 1. Final availability check before inserting
  if (input.kit_id) {
    const avail = await checkKitAvailability(
      input.kit_id,
      input.event_start,
      input.event_end
    );
    if (!avail.available) {
      throw new Error(
        `Kit indisponível para o período: ${avail.missing_items.join(", ")}`
      );
    }
  }

  // 2. Create the reservation record
  const { data: resData, error: resError } = await supabase
    .from("reservations")
    .insert({
      client_name: input.client_name,
      client_cpf: input.client_cpf,
      client_phone: input.client_phone ?? null,
      kit_id: input.kit_id ?? null,
      product_id: input.product_id ?? null,
      event_start: input.event_start.toISOString(),
      event_end: input.event_end.toISOString(),
      status: "Pendente",
      notes: input.notes ?? null,
    })
    .select("id")
    .single();

  if (resError || !resData) throw resError;
  const reservationId = (resData as { id: string }).id;

  // 3. Allocate SKUs via RPC (handles buffer logic)
  if (input.kit_id) {
    const { error: allocError } = await supabase.rpc(
      "allocate_kit_to_reservation",
      {
        p_reservation_id: reservationId,
        p_kit_id: input.kit_id,
        p_start: input.event_start.toISOString(),
        p_end: input.event_end.toISOString(),
      }
    );
    if (allocError) {
      // Rollback: delete the reservation we just created
      await supabase.from("reservations").delete().eq("id", reservationId);
      throw allocError;
    }
  }

  return { id: reservationId };
}

export async function updateReservationStatus(
  id: string,
  status: DbReservation["status"]
): Promise<void> {
  const { error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteReservation(id: string): Promise<void> {
  await supabase.from("reservation_items").delete().eq("reservation_id", id);
  const { error } = await supabase.from("reservations").delete().eq("id", id);
  if (error) throw error;
}
