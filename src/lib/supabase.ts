import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client com service role — usado apenas em Server Components e API Routes (nunca no browser)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export type DbProduct = {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  description: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  includes: DbInclude[];
};

export type DbInclude = {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
};

export type DbCategory = {
  id: string;
  name: string;
  sort_order: number;
};

export type DbBanner = {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  link: string;
  active: boolean;
  sort_order: number;
};

// ── Rental / Inventory types ─────────────────────────────────

export type DbItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  is_available: boolean;
  created_at: string;
};

export type DbKit = {
  id: string;
  product_id: string | null;
  name: string;
  description: string | null;
  price: number | null;
  active: boolean;
  created_at: string;
  kit_items?: DbKitItem[];
};

export type DbKitItem = {
  id: string;
  kit_id: string;
  category_needed: string | null;
  specific_sku: string | null;
  quantity: number;
};

export type DbReservation = {
  id: string;
  client_name: string;
  client_cpf: string;
  client_phone: string | null;
  kit_id: string | null;
  product_id: string | null;
  event_start: string;   // ISO string
  event_end: string;     // ISO string
  status: 'Pendente' | 'Confirmado' | 'Concluido' | 'Cancelado';
  notes: string | null;
  created_at: string;
  reservation_items?: DbReservationItem[];
  kits?: DbKit | null;
};

export type DbReservationItem = {
  id: string;
  reservation_id: string;
  item_sku: string;
  created_at: string;
  items?: DbItem;
};

export type AvailabilityResult = {
  available: boolean;
  missing_items: string[];
};
