import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getAllProductsAdmin } from "@/lib/products";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin");
  }

  const products = await getAllProductsAdmin();

  return <AdminDashboardClient initialProducts={products} />;
}
