import HomeClient from "./HomeClient";
import { getProducts } from "@/lib/products";

export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();
  return <HomeClient products={products} />;
}
