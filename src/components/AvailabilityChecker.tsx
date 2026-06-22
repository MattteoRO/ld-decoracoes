"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "available" | "unavailable" | "error";

interface Props {
  /** Either kitId or productId must be provided */
  kitId?: string;
  productId?: string;
}

export default function AvailabilityChecker({ kitId, productId }: Props) {
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("23:00");
  const [status, setStatus] = useState<Status>("idle");
  const [missingItems, setMissingItems] = useState<string[]>([]);

  async function handleCheck() {
    if (!eventDate) return;

    const start = new Date(`${eventDate}T${startTime}:00`);
    const end = new Date(`${eventDate}T${endTime}:00`);

    if (end <= start) {
      setStatus("error");
      setMissingItems(["O horário de fim deve ser posterior ao horário de início."]);
      return;
    }

    setStatus("loading");
    setMissingItems([]);

    try {
      const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
      });
      if (kitId) params.set("kitId", kitId);
      else if (productId) params.set("productId", productId);

      const res = await fetch(`/api/availability?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMissingItems([data.error ?? "Erro ao verificar disponibilidade."]);
        return;
      }

      if (data.available) {
        setStatus("available");
      } else {
        setStatus("unavailable");
        setMissingItems(data.missing_items ?? []);
      }
    } catch {
      setStatus("error");
      setMissingItems(["Erro de conexão. Tente novamente."]);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{
      padding: 16,
      backgroundColor: "var(--color-background-alt)",
      borderRadius: 14,
      border: "1px dashed var(--color-primary-light)",
    }}>
      <h2 style={{
        fontSize: 15, fontWeight: 600, color: "var(--color-primary)",
        display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
      }}>
        <Calendar size={18} /> Verificar Disponibilidade
      </h2>

      {/* Date picker */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 4 }}>
          Data do evento
        </label>
        <input
          type="date"
          value={eventDate}
          min={today}
          onChange={(e) => { setEventDate(e.target.value); setStatus("idle"); }}
          style={{
            width: "100%", padding: "10px 14px",
            borderRadius: 8, border: "1px solid var(--color-border)",
            fontSize: 14, fontFamily: "inherit",
            backgroundColor: "#fff",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Time range */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 4 }}>
            Início
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => { setStartTime(e.target.value); setStatus("idle"); }}
            style={{
              width: "100%", padding: "10px 14px",
              borderRadius: 8, border: "1px solid var(--color-border)",
              fontSize: 14, fontFamily: "inherit",
              backgroundColor: "#fff",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 4 }}>
            Fim
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => { setEndTime(e.target.value); setStatus("idle"); }}
            style={{
              width: "100%", padding: "10px 14px",
              borderRadius: 8, border: "1px solid var(--color-border)",
              fontSize: 14, fontFamily: "inherit",
              backgroundColor: "#fff",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <button
        onClick={handleCheck}
        disabled={!eventDate || status === "loading"}
        style={{
          width: "100%", padding: "11px",
          borderRadius: 8, border: "none",
          background: !eventDate
            ? "#d4a0b5"
            : "linear-gradient(135deg, #C5668E, #8B2252)",
          color: "#fff", fontSize: 14, fontWeight: 600,
          cursor: !eventDate ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            Verificando...
          </>
        ) : "Checar Disponibilidade"}
      </button>

      {/* Result */}
      {status === "available" && (
        <div style={{
          marginTop: 12, padding: "12px 14px",
          backgroundColor: "#d3f9d8", borderRadius: 10,
          display: "flex", alignItems: "center", gap: 10,
          border: "1px solid #8ce99a",
        }}>
          <CheckCircle2 size={20} color="#2b8a3e" />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1b5e20" }}>
              Disponível! 🎉
            </p>
            <p style={{ fontSize: 12, color: "#2b8a3e", marginTop: 2 }}>
              Este item está livre para a data e horário selecionados.
              Adicione ao orçamento e finalize pelo WhatsApp.
            </p>
          </div>
        </div>
      )}

      {status === "unavailable" && (
        <div style={{
          marginTop: 12, padding: "12px 14px",
          backgroundColor: "#fff0f0", borderRadius: 10,
          border: "1px solid #ffc9c9",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <XCircle size={20} color="#c92a2a" />
            <p style={{ fontSize: 14, fontWeight: 700, color: "#c92a2a" }}>
              Indisponível para esta data
            </p>
          </div>
          {missingItems.length > 0 && (
            <ul style={{ paddingLeft: 28, margin: 0 }}>
              {missingItems.map((item, i) => (
                <li key={i} style={{ fontSize: 12, color: "#a61c00", marginBottom: 2 }}>
                  {item}
                </li>
              ))}
            </ul>
          )}
          <p style={{ fontSize: 12, color: "#9e6a7e", marginTop: 8 }}>
            Entre em contato pelo WhatsApp para verificar outras datas disponíveis.
          </p>
        </div>
      )}

      {status === "error" && (
        <div style={{
          marginTop: 12, padding: "12px 14px",
          backgroundColor: "#fff3cd", borderRadius: 10,
          border: "1px solid #ffc107",
        }}>
          {missingItems.map((msg, i) => (
            <p key={i} style={{ fontSize: 13, color: "#856404" }}>{msg}</p>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
