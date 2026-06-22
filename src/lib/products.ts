import { supabase, DbProduct } from "./supabase";
import type { Product } from "@/data/products";

// Converts DB row to the Product type used throughout the app
function toProduct(row: DbProduct): Product {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    image: row.image,
    category: row.category,
    description: row.description,
    includes: (row.includes ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => i.name),
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, includes(*)")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map(toProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, includes(*)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return toProduct(data);
}

export async function getAllProductsAdmin() {
  const { data, error } = await supabase
    .from("products")
    .select("*, includes(*)")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data as DbProduct[];
}

export async function upsertProduct(product: {
  id?: string;
  title: string;
  price: number;
  image: string;
  category: string;
  description: string;
  active: boolean;
  sort_order: number;
  includes: string[];
}) {
  const { id, includes, ...fields } = product;

  let productId = id;

  if (id) {
    const { error } = await supabase.from("products").update(fields).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert(fields)
      .select("id")
      .single();
    if (error || !data) throw error;
    productId = data.id;
  }

  // Replace includes
  await supabase.from("includes").delete().eq("product_id", productId);
  if (includes.length > 0) {
    const rows = includes.map((name, i) => ({
      product_id: productId,
      name,
      sort_order: i,
    }));
    const { error } = await supabase.from("includes").insert(rows);
    if (error) throw error;
  }

  return productId;
}

export async function deleteProduct(id: string) {
  await supabase.from("includes").delete().eq("product_id", id);
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
