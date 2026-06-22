import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "product-images";

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Somente imagens são permitidas" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Tamanho máximo: 5MB" }, { status: 400 });
    }

    // Create unique filename
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist yet, return helpful error
      if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("bucket")) {
        return NextResponse.json({
          error: `Bucket "${bucket}" não encontrado no Supabase Storage. Crie o bucket pelo painel do Supabase.`
        }, { status: 400 });
      }
      throw uploadError;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);
    return NextResponse.json({ ok: true, url: urlData.publicUrl });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro no upload";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
