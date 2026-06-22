"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarCheck, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { DbReservation } from "@/lib/supabase";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Pendente:   { bg: "#fff3cd", color: "#856404" },
  Confirmado: { bg: "#d3f9d8", color: "#1b5e20" },
  Concluido:  { bg: "#e9ecef", color: "#495057" },
  Cancelado:  { bg: "#fff0f0", color: "#c92a2a" },
};

const STATUS_OPTIONS = ["Pendente", "Confirmado", "Concluido", "Cancelado"] as const;

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface Props { initialReservations: DbReservation[] }

export default function ReservationsClient({ initialReservations }: Props) {
  const router = useRouter();
  const [reservations, setReservations] = useState<DbReservation[]>(initialReservations);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [filter, setFilter] = useState<string>("todos");

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadReservations() {
    const res = await fetch("/api/reservations");
    if (res.ok) setReservations(await res.json());
  }

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.ok) { showToast("Status atualizado!"); await loadReservations(); }
      else { showToast(data.error || "Erro ao atualizar.", false); }
    } catch { showToast("Erro de conexão.", false); }
    finally { setUpdatingId(null); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta reserva? Esta ação libera os itens do acervo.")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/reservations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.ok) { showToast("Reserva removida."); await loadReservations(); }
      else { showToast(data.error || "Erro ao remover.", false); }
    } catch { showToast("Erro de conexão.", false); }
    finally { setDeletingId(null); }
  }

  const filtered = filter === "todos"
    ? reservations
    : reservations.filter(r => r.status === filter);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#FFF5F7", paddingBottom: 40 }}>
      <header style={{ backgroundColor: "#fff", padding: "16px 20px", borderBottom: "1px solid #f0d0de", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 20, boxShadow: "0 2px 8px rgba(139,34,82,0.06)" }}>
        <button onClick={() => router.push("/admin/dashboard")} style={{ background: "none", border: "none", color: "#8B2252", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, color: "#8B2252" }}>Reservas</h1>
          <p style={{ fontSize: 11, color: "#9e6a7e" }}>{reservations.length} reservas no total</p>
        </div>
      </header>

      <div style={{ padding: "20px 16px", maxWidth: 640, margin: "0 auto" }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
          {["todos", ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 999, border: filter === s ? "none" : "1px solid #f0d0de", background: filter === s ? "linear-gradient(135deg, #C5668E, #8B2252)" : "#fff", color: filter === s ? "#fff" : "#8B2252", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {s === "todos" ? "Todos" : s}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#b592a1" }}>
            <CalendarCheck size={48} strokeWidth={1} style={{ marginBottom: 12, color: "#d4a0b5" }} />
            <p>Nenhuma reserva encontrada.</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(r => {
            const colors = STATUS_COLORS[r.status] ?? STATUS_COLORS.Pendente;
            return (
              <div key={r.id} style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid #f0d0de", boxShadow: "0 2px 8px rgba(139,34,82,0.04)", overflow: "hidden" }}>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#3d1f2e" }}>{r.client_name}</p>
                      <p style={{ fontSize: 12, color: "#5a3547", marginTop: 2 }}>CPF: {r.client_cpf}</p>
                      {r.kits && <p style={{ fontSize: 12, color: "#8B2252", fontWeight: 600, marginTop: 2 }}>🎪 {(r.kits as { name: string }).name}</p>}
                      <p style={{ fontSize: 11, color: "#9e6a7e", marginTop: 4 }}>
                        📅 {fmtDateTime(r.event_start)} → {fmtDateTime(r.event_end)}
                      </p>
                    </div>
                    <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, backgroundColor: colors.bg, color: colors.color }}>
                      {r.status}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                    <select value={r.status} onChange={e => handleStatusChange(r.id, e.target.value)} disabled={updatingId === r.id} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid #f0d0de", fontSize: 13, backgroundColor: "#FFF5F7", color: "#3d1f2e", cursor: "pointer" }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #f0d0de", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B2252" }}>
                      {expandedId === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #ffc9c9", backgroundColor: "#fff0f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#c92a2a" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {expandedId === r.id && (
                  <div style={{ padding: "0 14px 14px", borderTop: "1px solid #f5e0ea" }}>
                    {r.notes && <p style={{ fontSize: 12, color: "#5a3547", marginTop: 10 }}>📝 {r.notes}</p>}
                    {r.reservation_items && r.reservation_items.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#8B2252", marginBottom: 6 }}>ITENS ALOCADOS ({r.reservation_items.length})</p>
                        {r.reservation_items.map(ri => (
                          <div key={ri.id} style={{ fontSize: 12, color: "#5a3547", marginBottom: 3 }}>
                            📦 <strong>{ri.item_sku}</strong>
                            {ri.items && ` — ${ri.items.name}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", backgroundColor: toast.ok ? "#2b8a3e" : "#c92a2a", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 100, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", whiteSpace: "nowrap" }}>
          {toast.msg}
        </div>
      )}
    </main>
  );
}
