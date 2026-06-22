import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import OrcamentosClient from "./OrcamentosClient";

export const dynamic = "force-dynamic";

export default async function OrcamentosPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  const { data } = await supabase
    .from("orcamentos")
    .select("*")
    .order("created_at", { ascending: false });

  return <OrcamentosClient initialOrcamentos={data ?? []} />;
}
