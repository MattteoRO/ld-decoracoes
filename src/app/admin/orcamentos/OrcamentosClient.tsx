"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, MapPin, ExternalLink } from "lucide-react";

const STATUS_OPTIONS = ["Novo", "Em andamento", "Fechado", "Cancelado"] as const;
type OrcStatus = typeof STATUS_OPTIONS[number];

const STATUS_COLORS: Record<OrcStatus, { bg: string; color: string }> = {
  "Novo":         { bg: "#fff3cd", color: "#856404" },
  "Em andamento": { bg: "#cff4fc", color: "#055160" },
  "Fechado":      { bg: "#d3f9d8", color: "#1b5e20" },
  "Cancelado":    { bg: "#fff0f0", color: "#c92a2a" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function OrcamentosClient({ initialOrcamentos }: { initialOrcamentos: any[] }) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orcamentos, setOrcamentos] = useState<any[]>(initialOrcamentos);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("todos");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadOrcamentos() {
    const res = await fetch("/api/admin/orcamentos");
    if (res.ok) setOrcamentos(await res.json());
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/orcamentos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) { showToast("Status atualizado!"); await loadOrcamentos(); }
      else showToast("Erro ao atualizar.", false);
    } finally { setUpdatingId(null); }
  }

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("pt-BR") : "—";
  const fmtDateTime = (d: string) => d ? new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const filtered = filter === "todos" ? orcamentos : orcamentos.filter(o => o.status === filter);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#FFF5F7", paddingBottom: 40 }}>
      <header style={{ backgroundColor: "#fff", padding: "16px 20px", borderBottom: "1px solid #f0d0de", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 20 }}>
        <button onClick={() => router.push("/admin/dashboard")} style={{ background: "none", border: "none", color: "#8B2252", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, color: "#8B2252" }}>Orçamentos</h1>
          <p style={{ fontSize: 11, color: "#9e6a7e" }}>{orcamentos.length} recebidos</p>
        </div>
      </header>

      <div style={{ padding: "16px", maxWidth: 640, margin: "0 auto" }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
          {["todos", ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 999, border: filter === s ? "none" : "1px solid #f0d0de", background: filter === s ? "linear-gradient(135deg, #C5668E, #8B2252)" : "#fff", color: filter === s ? "#fff" : "#8B2252", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {s === "todos" ? "Todos" : s}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: "#b592a1" }}>
            <p>Nenhum orçamento encontrado.</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(o => {
            const statusColor = STATUS_COLORS[o.status as OrcStatus] ?? STATUS_COLORS["Novo"];
            const isExpanded = expandedId === o.id;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cartItems: any[] = Array.isArray(o.cart) ? o.cart : [];

            return (
              <div key={o.id} style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid #f0d0de", overflow: "hidden" }}>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#3d1f2e" }}>{o.client_name}</p>
                      <p style={{ fontSize: 12, color: "#5a3547" }}>CPF: {o.client_cpf}</p>
                      {o.client_phone && <p style={{ fontSize: 12, color: "#5a3547" }}>📱 {o.client_phone}</p>}
                      <p style={{ fontSize: 11, color: "#9e6a7e", marginTop: 4 }}>
                        🎉 {fmtDate(o.data_festa)} · 🛠️ {fmtDate(o.data_montagem)}
                      </p>
                      {o.local_festa && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                          <MapPin size={12} color="#8B2252" />
                          <p style={{ fontSize: 11, color: "#5a3547", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.local_festa}</p>
                          {o.local_lat && o.local_lng && (
                            <a href={`https://maps.google.com/?q=${o.local_lat},${o.local_lng}`} target="_blank" rel="noopener noreferrer" style={{ color: "#8B2252", display: "flex" }}>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      )}
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#8B2252", marginTop: 6 }}>
                        💰 {fmt(o.total)} · {cartItems.length} item(ns)
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, backgroundColor: statusColor.bg, color: statusColor.color }}>
                        {o.status}
                      </span>
                      <p style={{ fontSize: 10, color: "#b592a1" }}>{fmtDateTime(o.created_at)}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} disabled={updatingId === o.id} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid #f0d0de", fontSize: 13, backgroundColor: "#FFF5F7", color: "#3d1f2e", cursor: "pointer" }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setExpandedId(isExpanded ? null : o.id)} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #f0d0de", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B2252" }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && cartItems.length > 0 && (
                  <div style={{ padding: "0 14px 14px", borderTop: "1px solid #f5e0ea" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#8B2252", marginTop: 10, marginBottom: 8 }}>ITENS ({cartItems.length})</p>
                    {cartItems.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, padding: "8px 10px", backgroundColor: "#FFF5F7", borderRadius: 8 }}>
                        {item.product?.image && <img src={item.product.image} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }} />}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#3d1f2e" }}>{item.product?.title}</p>
                          <p style={{ fontSize: 11, color: "#9e6a7e" }}>{item.quantity}x · {fmt(item.product?.price * item.quantity)}</p>
                          {item.customNotes && <p style={{ fontSize: 11, color: "#5a3547" }}>📝 {item.customNotes}</p>}
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: "1px dashed #f0d0de", paddingTop: 8, marginTop: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9e6a7e" }}><span>Subtotal</span><span>{fmt(o.subtotal)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#2b8a3e" }}><span>Desconto Pix</span><span>-{fmt(o.desconto)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#8B2252", marginTop: 4 }}><span>Total</span><span>{fmt(o.total)}</span></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", backgroundColor: toast.ok ? "#2b8a3e" : "#c92a2a", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 100, whiteSpace: "nowrap" }}>
          {toast.msg}
        </div>
      )}
    </main>
  );
}
