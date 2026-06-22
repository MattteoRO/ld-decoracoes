import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

export const revalidate = 60; // revalidate every 60 seconds

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}
