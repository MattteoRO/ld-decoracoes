"use client";

import { useCart } from "@/context/CartContext";
import { ArrowLeft, Trash2, MessageCircle, CreditCard, Minus, Plus, Calendar, Download, User, IdCard, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import LocationPicker, { LocationData } from "@/components/LocationPicker";
import { useState, useCallback } from "react";
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
  const [horaFesta, setHoraFesta] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [cpfCliente, setCpfCliente] = useState("");
  const [cpfTouched, setCpfTouched] = useState(false);
  const [localFesta, setLocalFesta] = useState<LocationData | null>(null);
  const [showError, setShowError] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const discount = cartTotal * 0.05;
  const totalWithDiscount = cartTotal - discount;

  const cpfDigits = cpfCliente.replace(/\D/g, "");
  const cpfCompleto = cpfDigits.length === 11;
  const cpfValido = cpfCompleto && validateCPF(cpfCliente);
  const cpfInvalido = cpfCompleto && !cpfValido;

  const handleCPFChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCpfCliente(formatCPF(e.target.value));
    if (!cpfTouched) setCpfTouched(true);
  }, [cpfTouched]);

  const handleCPFBlur = useCallback(() => setCpfTouched(true), []);

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  const fmtDate = (d: string) => {
    if (!d) return "—";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const isFormValid = () =>
    nomeCliente.trim().split(" ").length >= 2 &&
    cpfValido &&
    !!dataFesta &&
    !!dataMontagem &&
    !!localFesta;

  const handleSendWhatsApp = async () => {
    if (cart.length === 0) return;
    if (!isFormValid()) {
      setShowError(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSending(true);

    // Build payload
    const payload = {
      cart,
      dataFesta,
      dataMontagem,
      horaFesta,
      cartTotal,
      nomeCliente,
      cpfCliente,
      telefoneCliente,
      localFesta,
      type: "orcamento",
    };

    // Send to Telegram + save to DB
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch { /* fire and forget */ }

    // Build WhatsApp message
    let message = "🎀 *ORÇAMENTO - LD DECORAÇÕES* 🎀\n\n";
    message += "Olá! Gostaria de solicitar o seguinte orçamento:\n\n";
    message += `👤 *Nome:* ${nomeCliente}\n`;
    message += `🪪 *CPF:* ${cpfCliente}\n`;
    if (telefoneCliente) message += `📱 *Telefone:* ${telefoneCliente}\n`;
    message += `📅 *Data da Festa:* ${fmtDate(dataFesta)}${horaFesta ? ` às ${horaFesta}` : ""}\n`;
    message += `🛠️ *Data da Montagem:* ${fmtDate(dataMontagem)}\n`;
    if (localFesta) message += `📍 *Local:* ${localFesta.address}\n`;
    message += `\n*ITENS SELECIONADOS:*\n`;

    cart.forEach((item, i) => {
      message += `\n*${i + 1}. ${item.product.title}*\n`;
      message += `   Qtd: ${item.quantity}x | Valor: ${fmt(item.product.price * item.quantity)}\n`;
      const selectedArr = item.selectedIncludes ?? item.product.includes ?? [];
      const deselected = (item.product.includes ?? []).filter(inc => !selectedArr.includes(inc));
      if (selectedArr.length > 0) message += `   ✓ Inclui: ${selectedArr.join(", ")}\n`;
      if (deselected.length > 0) message += `   ✗ Removido: ${deselected.join(", ")}\n`;
      if (item.customNotes) message += `   📝 Obs: ${item.customNotes}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━\n`;
    message += `*Subtotal:* ${fmt(cartTotal)}\n`;
    message += `*Desconto Pix (5%):* -${fmt(discount)}\n`;
    message += `*💰 TOTAL:* ${fmt(totalWithDiscount)}\n\n`;
    message += `Aguardo retorno com disponibilidade e formas de pagamento! 🙏`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
    setSending(false);
    setSent(true);
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
    }
  };

  const inputStyle = (hasErr: boolean): React.CSSProperties => ({
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: `1px solid ${hasErr ? "#c92a2a" : "var(--color-border)"}`,
    backgroundColor: "var(--color-background)", color: "var(--color-text-main)",
    fontSize: 14, fontFamily: "inherit", boxSizing: "border-box",
  });

  const nomeInvalido = showError && nomeCliente.trim().split(" ").length < 2;

  return (
    <main className="animate-fade-in" style={{ paddingBottom: 100, minHeight: "100vh", backgroundColor: "var(--color-background)" }}>
      <header style={{ padding: "20px", backgroundColor: "#fff", position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid var(--color-border)" }}>
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

            {/* Banner de confirmação pós-envio */}
      {sent && (
        <div style={{ margin: "16px 16px 0", padding: "16px 20px", backgroundColor: "#d3f9d8", borderRadius: 14, border: "1px solid #8ce99a" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#1b5e20", marginBottom: 6 }}>✅ Solicitação enviada!</p>
          <p style={{ fontSize: 13, color: "#2b5e20", lineHeight: 1.6 }}>
            Seu orçamento foi enviado pelo WhatsApp e registrado no nosso sistema.
            <br /><strong>Aguarde nosso retorno em até 24h para confirmação e fechamento.</strong>
          </p>
          <p style={{ fontSize: 12, color: "#2b8a3e", marginTop: 8 }}>
            💡 O pagamento é feito somente após a confirmação do serviço — não é necessário pagar agora.
          </p>
        </div>
      )}

      {/* Indicador de progresso */}
      <div style={{ margin: "16px 16px 0", padding: "12px 16px", backgroundColor: "#fff", borderRadius: 12, border: "1px solid var(--color-border)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Como funciona</p>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {[
            { step: "1", label: "Orçamento", done: cart.length > 0 },
            { step: "2", label: "WhatsApp", done: sent },
            { step: "3", label: "Confirmação", done: false },
            { step: "4", label: "Pagamento", done: false },
          ].map((s, i, arr) => (
            <div key={s.step} style={{ display: "flex", alignItems: "center", flex: i < arr.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, backgroundColor: s.done ? "#8B2252" : "#f0d0de", color: s.done ? "#fff" : "#9e6a7e" }}>
                  {s.done ? "✓" : s.step}
                </div>
                <span style={{ fontSize: 10, color: s.done ? "#8B2252" : "#9e6a7e", fontWeight: s.done ? 700 : 400, whiteSpace: "nowrap" }}>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div style={{ flex: 1, height: 2, backgroundColor: s.done ? "#8B2252" : "#f0d0de", margin: "0 4px", marginBottom: 16 }} />}
            </div>
          ))}
        </div>
      </div>
            {showError && !isFormValid() && (
              <div style={{ margin: "0 0 16px", padding: "12px 16px", backgroundColor: "#fff0f6", color: "#c92a2a", borderRadius: 10, fontSize: 13, border: "1px solid #ffc9c9" }}>
                ⚠️ Preencha todos os campos obrigatórios (*) corretamente antes de continuar.
              </div>
            )}

            {/* Dados do Cliente */}
            <div style={{ margin: "0 0 16px", backgroundColor: "#fff", borderRadius: 14, padding: 20, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <User size={18} /> Seus Dados
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Nome */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 6 }}>Nome Completo *</label>
                  <div style={{ position: "relative" }}>
                    <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
                    <input type="text" value={nomeCliente} onChange={e => { setNomeCliente(e.target.value); setShowError(false); }} placeholder="Seu nome completo" style={{ ...inputStyle(nomeInvalido), paddingLeft: 36 }} />
                  </div>
                  {nomeInvalido && <p style={{ fontSize: 11, color: "#c92a2a", marginTop: 4 }}>Informe nome e sobrenome.</p>}
                </div>

                {/* CPF com validação em tempo real */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 6 }}>CPF *</label>
                  <div style={{ position: "relative" }}>
                    <IdCard size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
                    <input
                      type="text" inputMode="numeric"
                      value={cpfCliente}
                      onChange={handleCPFChange}
                      onBlur={handleCPFBlur}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      style={{ ...inputStyle(cpfTouched && cpfInvalido), paddingLeft: 36, paddingRight: 40 }}
                    />
                    {/* Feedback em tempo real */}
                    {cpfCompleto && (
                      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
                        {cpfValido
                          ? <CheckCircle2 size={18} color="#2b8a3e" />
                          : <XCircle size={18} color="#c92a2a" />
                        }
                      </div>
                    )}
                  </div>
                  {cpfCompleto && (
                    <p style={{ fontSize: 11, marginTop: 4, color: cpfValido ? "#2b8a3e" : "#c92a2a", display: "flex", alignItems: "center", gap: 4 }}>
                      {cpfValido ? "✅ CPF válido" : "❌ CPF inválido — verifique os números"}
                    </p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 6 }}>Telefone / WhatsApp</label>
                  <input type="tel" value={telefoneCliente} onChange={e => setTelefoneCliente(e.target.value)} placeholder="(69) 99999-9999" style={inputStyle(false)} />
                </div>
              </div>
            </div>

            {/* Datas */}
            <div style={{ margin: "0 0 16px", backgroundColor: "#fff", borderRadius: 14, padding: 20, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Calendar size={18} /> Datas do Evento
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 6 }}>Data da Festa *</label>
                    <input type="date" value={dataFesta} onChange={e => { setDataFesta(e.target.value); setShowError(false); }} style={inputStyle(showError && !dataFesta)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 6 }}>Horário</label>
                    <input type="time" value={horaFesta} onChange={e => setHoraFesta(e.target.value)} style={inputStyle(false)} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 6 }}>Data da Montagem *</label>
                  <input type="date" value={dataMontagem} onChange={e => { setDataMontagem(e.target.value); setShowError(false); }} style={inputStyle(showError && !dataMontagem)} />
                </div>
              </div>
            </div>

            {/* Local da Festa */}
            <div style={{ margin: "0 0 16px", backgroundColor: "#fff", borderRadius: 14, padding: 20, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <MapPin size={18} /> Local da Festa *
              </h2>
              <LocationPicker
                value={localFesta}
                onChange={loc => { setLocalFesta(loc); setShowError(false); }}
                hasError={showError && !localFesta}
              />
              {showError && !localFesta && (
                <p style={{ fontSize: 11, color: "#c92a2a", marginTop: 6 }}>Selecione o local da festa no mapa.</p>
              )}
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
                    <div style={{ margin: "4px 0 8px" }}>
                      <label style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-muted)" }}>Observações (cores, detalhes):</label>
                      <textarea value={item.customNotes ?? ""} onChange={(e) => {
                        const current = item.selectedIncludes ?? item.product.includes ?? [];
                        updateCustomization(item.product.id, current, e.target.value);
                      }} placeholder="Ex: cor do balão rosa e azul..." style={{ width: "100%", minHeight: 36, padding: "6px", borderRadius: 6, border: "1px solid var(--color-border)", fontSize: 11, fontFamily: "inherit", resize: "vertical", marginTop: 4 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-primary)" }}>{fmt(item.product.price * item.quantity)}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--color-border)", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}><Minus size={14} /></button>
                        <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "linear-gradient(135deg, #C5668E, #8B2252)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", color: "#c92a2a", cursor: "pointer", padding: 4 }}><Trash2 size={16} strokeWidth={1.5} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="orcamento-right">
            <div style={{ margin: "0 0 16px", backgroundColor: "#fff", borderRadius: 14, padding: 20, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "var(--color-text-muted)" }}><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "#2b8a3e" }}><span>Desconto Pix (5%)</span><span>- {fmt(discount)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: "1px dashed var(--color-border)", fontSize: 18, fontWeight: 700, color: "var(--color-primary)" }}><span>Total Estimado</span><span>{fmt(totalWithDiscount)}</span></div>
            </div>

            <div style={{ margin: "0 0 24px", padding: 16, backgroundColor: "var(--color-background-alt)", borderRadius: 14, border: "1px dashed var(--color-primary-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-primary)", fontSize: 14, fontWeight: 600, marginBottom: 8 }}><CreditCard size={18} /> Formas de Pagamento</div>
              <p style={{ fontSize: 13, color: "var(--color-text-main)", lineHeight: 1.6 }}>• <strong>Pix:</strong> 5% de desconto à vista.<br />• <strong>Cartão:</strong> Parcele em até 12x.</p>
            </div>

            <div style={{ padding: "0 0 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <button className="btn-primary" onClick={handleSendWhatsApp} disabled={sending} style={{ fontSize: 15, width: "100%" }}>
                <MessageCircle size={20} strokeWidth={2} />
                {sending ? "ENVIANDO..." : "FINALIZAR VIA WHATSAPP"}
              </button>
              <button className="btn-secondary" onClick={handleDownloadPDF} style={{ fontSize: 15, width: "100%", backgroundColor: "#fff" }}>
                <Download size={20} strokeWidth={2} />
                BAIXAR PDF
              </button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </main>
  );
}
