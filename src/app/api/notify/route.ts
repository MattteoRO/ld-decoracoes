import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cart, dataFesta, dataMontagem, horaFesta,
      cartTotal, nomeCliente, cpfCliente, telefoneCliente,
      localFesta, type,
    } = body;

    const discount = cartTotal * 0.05;
    const total = cartTotal - discount;

    const fmt = (v: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

    const fmtDate = (d: string) => {
      if (!d) return "—";
      const [y, m, day] = d.split("-");
      return `${day}/${m}/${y}`;
    };

    const emoji = type === "orcamento" ? "💌" : "📦";
    const title = type === "orcamento" ? "NOVO ORÇAMENTO" : "NOVA RESERVA";

    // ── Build Telegram message ──────────────────────────────
    let msg = `${emoji} *${title} - LD Decorações*\n\n`;
    if (nomeCliente) msg += `👤 *Nome:* ${nomeCliente}\n`;
    if (cpfCliente)  msg += `🪪 *CPF:* ${cpfCliente}\n`;
    if (telefoneCliente) msg += `📱 *Tel:* ${telefoneCliente}\n`;
    msg += `📅 *Data da Festa:* ${fmtDate(dataFesta)}${horaFesta ? ` às ${horaFesta}` : ""}\n`;
    msg += `🛠️ *Montagem:* ${fmtDate(dataMontagem)}\n`;
    if (localFesta?.address) msg += `📍 *Local:* ${localFesta.address}\n`;
    if (localFesta?.lat && localFesta?.lng) {
      msg += `🗺️ *Mapa:* https://maps.google.com/?q=${localFesta.lat},${localFesta.lng}\n`;
    }
    msg += `\n*ITENS:*\n`;

    for (const [i, item] of (cart as Array<{ product: { title: string; price: number }; quantity: number; selectedIncludes?: string[]; customNotes?: string }>).entries()) {
      msg += `\n*${i + 1}. ${item.product.title}*\n`;
      msg += `   ${item.quantity}x | ${fmt(item.product.price * item.quantity)}\n`;
      if (item.selectedIncludes?.length) msg += `   ✓ ${item.selectedIncludes.join(", ")}\n`;
      if (item.customNotes) msg += `   📝 ${item.customNotes}\n`;
    }

    msg += `\n━━━━━━━━━━━━━━━\n`;
    msg += `Subtotal: ${fmt(cartTotal)}\n`;
    msg += `Desconto Pix (5%): -${fmt(discount)}\n`;
    msg += `*💰 TOTAL: ${fmt(total)}*`;

    // ── Send to Telegram ────────────────────────────────────
    const tgRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: msg,
          parse_mode: "Markdown",
        }),
      }
    );

    const tgData = await tgRes.json();
    if (!tgData.ok) {
      console.error("Telegram error:", tgData.description);
      // Don't fail the whole request just because Telegram failed
    }

    // ── Save to Supabase ────────────────────────────────────
    const { error: dbError } = await supabase.from("orcamentos").insert({
      client_name:   nomeCliente ?? "",
      client_cpf:    cpfCliente ?? "",
      client_phone:  telefoneCliente ?? null,
      data_festa:    dataFesta,
      data_montagem: dataMontagem,
      local_festa:   localFesta?.address ?? null,
      local_lat:     localFesta?.lat ?? null,
      local_lng:     localFesta?.lng ?? null,
      cart:          cart,
      subtotal:      cartTotal,
      desconto:      discount,
      total:         total,
      status:        "Novo",
    });

    if (dbError) {
      console.error("DB save error:", dbError.message);
      // Don't fail — Telegram already sent
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
