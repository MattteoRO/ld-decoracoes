import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllItems, getAllKits } from "@/lib/reservations";
import InventoryClient from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin");
  }

  const [items, kits] = await Promise.all([getAllItems(), getAllKits()]);

  return <InventoryClient initialItems={items} initialKits={kits} />;
}
