import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cart, dataFesta, dataMontagem, cartTotal, nomeCliente, cpfCliente, type } = body;

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

    let msg = `${emoji} *${title} - LD Decorações*\n\n`;
    if (nomeCliente) msg += `👤 *Nome:* ${nomeCliente}\n`;
    if (cpfCliente) msg += `🪪 *CPF:* ${cpfCliente}\n`;
    msg += `📅 *Data da Festa:* ${fmtDate(dataFesta)}\n`;
    msg += `🛠️ *Data da Montagem:* ${fmtDate(dataMontagem)}\n\n`;
    msg += `*ITENS SELECIONADOS:*\n`;

    for (const [i, item] of cart.entries()) {
      msg += `\n*${i + 1}. ${item.product.title}*\n`;
      msg += `   Qtd: ${item.quantity}x | ${fmt(item.product.price * item.quantity)}\n`;
      if (item.selectedIncludes?.length) {
        msg += `   ✓ ${item.selectedIncludes.join(", ")}\n`;
      }
      if (item.customNotes) {
        msg += `   📝 ${item.customNotes}\n`;
      }
    }

    msg += `\n━━━━━━━━━━━━━━━\n`;
    msg += `Subtotal: ${fmt(cartTotal)}\n`;
    msg += `Desconto Pix (5%): -${fmt(discount)}\n`;
    msg += `*💰 TOTAL: ${fmt(total)}*`;

    const res = await fetch(
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

    const data = await res.json();
    if (!data.ok) {
      return NextResponse.json({ error: data.description }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
