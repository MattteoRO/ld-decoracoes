import { getAllKits } from "@/lib/reservations";
import BuilderClient from "./BuilderClient";

export const revalidate = 60;

export default async function BuilderPage() {
  const kits = await getAllKits();
  const activeKits = kits.filter(k => k.active);
  return <BuilderClient kits={activeKits} />;
}
