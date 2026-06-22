"use client";

import { useCart } from "@/context/CartContext";
import { ArrowLeft, Trash2, MessageCircle, CreditCard, Minus, Plus, Calendar, Download, User, IdCard } from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const WHATSAPP_NUMBER = "5569992693194";

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(digits[10]);
}

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function OrcamentoPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, updateCustomization } = useCart();
  const router = useRouter();

  const [dataFesta, setDataFesta] = useState("");
  const [dataMontagem, setDataMontagem] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [cpfCliente, setCpfCliente] = useState("");
  const [showError, setShowError] = useState(false);
  const [cpfError, setCpfError] = useState("");

  const discount = cartTotal * 0.05;
  const totalWithDiscount = cartTotal - discount;

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpfCliente(formatted);
    if (cpfError) setCpfError("");
  };

  const handleSendWhatsApp = async () => {
    if (cart.length === 0) return;

    let hasError = false;

    if (!nomeCliente.trim() || nomeCliente.trim().split(" ").length < 2) {
      hasError = true;
    }
    if (!validateCPF(cpfCliente)) {
      setCpfError("CPF inválido. Verifique os números digitados.");
      hasError = true;
    }
    if (!dataFesta || !dataMontagem) {
      hasError = true;
    }

    if (hasError) {
      setShowError(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Notify via Telegram (fire and forget)
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart, dataFesta, dataMontagem, cartTotal, nomeCliente, cpfCliente, type: "orcamento" }),
    }).catch(() => {});

    let message = "🎀 *ORÇAMENTO - LD DECORAÇÕES* 🎀\n\n";
    message += "Olá! Gostaria de solicitar o seguinte orçamento:\n\n";
    message += `👤 *Nome:* ${nomeCliente}\n`;
    message += `🪪 *CPF:* ${cpfCliente}\n`;
    message += `📅 *Data da Festa:* ${new Date(dataFesta).toLocaleDateString("pt-BR")}\n`;
    message += `🛠️ *Data da Montagem:* ${new Date(dataMontagem).toLocaleDateString("pt-BR")}\n\n`;
    message += `*ITENS SELECIONADOS:*\n`;

    cart.forEach((item, i) => {
      message += `*${i + 1}. ${item.product.title}*\n`;
      message += `   Qtd: ${item.quantity}x | Valor: R$ ${(item.product.price * item.quantity).toFixed(2)}\n`;
      const selectedArr = item.selectedIncludes ?? item.product.includes ?? [];
      const deselected = (item.product.includes ?? []).filter(inc => !selectedArr.includes(inc));
      if (selectedArr.length > 0) message += `   ✓ Inclui: ${selectedArr.join(", ")}\n`;
      if (deselected.length > 0) message += `   ✗ Removido: ${deselected.join(", ")}\n`;
      if (item.customNotes) message += `   📝 Observações: ${item.customNotes}\n`;
      message += `\n`;
    });

    message += `━━━━━━━━━━━━━━━━━\n`;
    message += `*Subtotal:* R$ ${cartTotal.toFixed(2)}\n`;
    message += `*Desconto Pix (5%):* -R$ ${discount.toFixed(2)}\n`;
    message += `*💰 TOTAL:* R$ ${totalWithDiscount.toFixed(2)}\n\n`;
    message += `Aguardo retorno com disponibilidade e formas de pagamento! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("orcamento-content");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#FFF5F7" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Orcamento_LD_Decoracoes.pdf");
    } catch (err) {
      console.error("Erro ao gerar PDF", err);
      alert("Houve um erro ao gerar o PDF. Tente novamente.");
    }
  };

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const inputStyle = (hasErr: boolean): React.CSSProperties => ({
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: `1px solid ${hasErr ? "#c92a2a" : "var(--color-border)"}`,
    backgroundColor: "var(--color-background)", color: "var(--color-text-main)",
    fontSize: 14, fontFamily: "inherit",
  });

  const nomeInvalido = showError && nomeCliente.trim().split(" ").length < 2;
  const cpfInvalido = showError && !validateCPF(cpfCliente);

  return (
    <main className="animate-fade-in" style={{ paddingBottom: 100, minHeight: "100vh", backgroundColor: "var(--color-background)" }}>
      <header style={{
        padding: "20px", backgroundColor: "#fff",
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", alignItems: "center", gap: 16,
        borderBottom: "1px solid var(--color-border)",
      }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>
        <h1 className="font-serif" style={{ fontSize: 20, color: "var(--color-text-main)" }}>Meu Orçamento</h1>
      </header>

      {cart.length === 0 ? (
        <div style={{ padding: "64px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "var(--color-text-muted)" }}>
          <MessageCircle size={56} strokeWidth={1} style={{ color: "var(--color-primary-light)" }} />
          <p style={{ fontSize: 15 }}>Sua lista de orçamento está vazia.</p>
          <p style={{ fontSize: 13 }}>Adicione itens clicando no 🛒 ao lado dos produtos.</p>
          <button className="btn-primary" onClick={() => router.push("/")} style={{ marginTop: 8, maxWidth: 260 }}>Ver Catálogo</button>
        </div>
      ) : (
        <div className="orcamento-layout" id="orcamento-content" style={{ padding: "16px 0" }}>
          <div className="orcamento-left">

            {/* Dados do Cliente */}
            <div style={{ margin: "0 0 16px", backgroundColor: "#fff", borderRadius: 14, padding: 20, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <User size={18} /> Seus Dados
              </h2>

              {showError && (nomeInvalido || cpfInvalido || !dataFesta || !dataMontagem) && (
                <div style={{ padding: "10px 14px", backgroundColor: "#fff0f6", color: "#c92a2a", borderRadius: 8, fontSize: 13, marginBottom: 16, border: "1px solid #ffc9c9" }}>
                  Preencha todos os campos obrigatórios corretamente para prosseguir.
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 6 }}>
                    Nome Completo *
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
                    <input
                      type="text"
                      value={nomeCliente}
                      onChange={e => { setNomeCliente(e.target.value); setShowError(false); }}
                      placeholder="Digite seu nome completo"
                      style={{ ...inputStyle(nomeInvalido), paddingLeft: 36 }}
                    />
                  </div>
                  {nomeInvalido && <p style={{ fontSize: 11, color: "#c92a2a", marginTop: 4 }}>Informe o nome completo (nome e sobrenome).</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 6 }}>
                    CPF *
                  </label>
                  <div style={{ position: "relative" }}>
                    <IdCard size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cpfCliente}
                      onChange={handleCPFChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      style={{ ...inputStyle(cpfInvalido), paddingLeft: 36 }}
                    />
                  </div>
                  {cpfInvalido && <p style={{ fontSize: 11, color: "#c92a2a", marginTop: 4 }}>{cpfError || "CPF inválido. Verifique os números digitados."}</p>}
                </div>
              </div>
            </div>

            {/* Datas */}
            <div style={{ margin: "0 0 16px", backgroundColor: "#fff", borderRadius: 14, padding: 20, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Calendar size={18} /> Datas do Evento
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 6 }}>Data da Festa *</label>
                  <input type="date" value={dataFesta} onChange={e => { setDataFesta(e.target.value); setShowError(false); }} style={inputStyle(showError && !dataFesta)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 6 }}>Data da Montagem *</label>
                  <input type="date" value={dataMontagem} onChange={e => { setDataMontagem(e.target.value); setShowError(false); }} style={inputStyle(showError && !dataMontagem)} />
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div style={{ padding: "0 0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 4 }}>Itens Selecionados</h2>
              {cart.map((item) => (
                <div key={item.product.id} style={{ backgroundColor: "#fff", borderRadius: 14, padding: 12, display: "flex", gap: 12, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", position: "relative" }}>
                  <img src={item.product.image} alt={item.product.title} style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-main)", lineHeight: 1.3, marginBottom: 4 }}>{item.product.title}</span>

                    {item.product.includes && item.product.includes.length > 0 && (
                      <div style={{ margin: "6px 0", padding: "8px 10px", backgroundColor: "var(--color-background-alt)", borderRadius: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-primary)", marginBottom: 4 }}>Subprodutos inclusos:</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {item.product.includes.map(inc => {
                            const isChecked = (item.selectedIncludes ?? item.product.includes ?? []).includes(inc);
                            return (
                              <label key={inc} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--color-text-main)", cursor: "pointer" }}>
                                <input type="checkbox" checked={isChecked} onChange={(e) => {
                                  const current = item.selectedIncludes ?? item.product.includes ?? [];
                                  const updated = e.target.checked ? [...current, inc] : current.filter(x => x !== inc);
                                  updateCustomization(item.product.id, updated, item.customNotes ?? "");
                                }} />
                                {inc}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div style={{ margin: "4px 0 8px", display: "flex", flexDirection: "column", gap: 2 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-muted)" }}>Pedido de Alteração (cores, detalhes, etc.):</label>
                      <textarea placeholder="Ex: cor do balão rosa e azul, bolo de 3 andares..." value={item.customNotes ?? ""} onChange={(e) => {
                        const current = item.selectedIncludes ?? item.product.includes ?? [];
                        updateCustomization(item.product.id, current, e.target.value);
                      }} style={{ width: "100%", minHeight: 40, padding: "6px", borderRadius: 6, border: "1px solid var(--color-border)", fontSize: 11, fontFamily: "inherit", resize: "vertical" }} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-primary)" }}>{fmt(item.product.price * item.quantity)}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--color-border)", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "linear-gradient(135deg, #C5668E, #8B2252)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", color: "#c92a2a", cursor: "pointer", padding: 4 }}>
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="orcamento-right">
            {/* Summary */}
            <div style={{ margin: "0 0 16px", backgroundColor: "#fff", borderRadius: 14, padding: 20, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "var(--color-text-muted)" }}>
                <span>Subtotal</span><span>{fmt(cartTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "#2b8a3e" }}>
                <span>Desconto Pix (5%)</span><span>- {fmt(discount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: "1px dashed var(--color-border)", fontSize: 18, fontWeight: 700, color: "var(--color-primary)" }}>
                <span>Total Estimado</span><span>{fmt(totalWithDiscount)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div style={{ margin: "0 0 24px", padding: 16, backgroundColor: "var(--color-background-alt)", borderRadius: 14, border: "1px dashed var(--color-primary-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-primary)", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                <CreditCard size={18} /> Formas de Pagamento
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-main)", lineHeight: 1.6 }}>
                • <strong>Pix:</strong> 5% de desconto à vista.<br />
                • <strong>Cartão:</strong> Parcele em até 12x (consulte via WhatsApp).
              </p>
            </div>

            {/* Actions */}
            <div style={{ padding: "0 0 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <button className="btn-primary" onClick={handleSendWhatsApp} style={{ fontSize: 15, width: "100%" }}>
                <MessageCircle size={20} strokeWidth={2} />
                FINALIZAR VIA WHATSAPP
              </button>
              <button className="btn-secondary" onClick={handleDownloadPDF} style={{ fontSize: 15, width: "100%", backgroundColor: "#fff" }}>
                <Download size={20} strokeWidth={2} />
                BAIXAR ORÇAMENTO EM PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
