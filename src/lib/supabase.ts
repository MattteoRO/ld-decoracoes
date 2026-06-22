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
