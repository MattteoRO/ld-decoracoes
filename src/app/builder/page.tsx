import { getProducts } from "@/lib/products";
import BuilderClient from "./BuilderClient";

export const revalidate = 60;

export default async function BuilderPage() {
  const all = await getProducts();
  const pegueEMonte = all.filter(p =>
    p.category.toLowerCase().includes("pegue") ||
    p.category.toLowerCase().includes("monte")
  );
  return <BuilderClient products={pegueEMonte} />;
}
