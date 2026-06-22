import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { data, error } = await supabase.from("orcamentos").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id, status } = await req.json();
  const { error } = await supabase.from("orcamentos").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
