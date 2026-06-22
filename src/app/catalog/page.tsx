import { getProducts } from "@/lib/products";
import CatalogClient from "./CatalogClient";

export const revalidate = 60;

export default async function CatalogPage() {
  const products = await getProducts();
  return <CatalogClient products={products} />;
}
