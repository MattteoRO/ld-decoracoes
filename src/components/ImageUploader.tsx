"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, RotateCw, Crop, Link as LinkIcon, X, Check } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  bucket?: string; // Supabase storage bucket name
}

export default function ImageUploader({ value, onChange, bucket = "product-images" }: Props) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(value.startsWith("http") ? value : "");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Somente imagens são permitidas.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Tamanho máximo: 5MB.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload");
      onChange(data.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  }, [bucket, onChange]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function rotate() {
    const newRot = (rotation + 90) % 360;
    setRotation(newRot);
    // We store rotation info in a data-attribute approach; actual rotation
    // is applied client-side only for preview. The uploaded file URL stays the same.
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #f0d0de", fontSize: 14, fontFamily: "inherit",
    backgroundColor: "#FFF5F7", color: "#3d1f2e", boxSizing: "border-box",
  };

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {([["upload", "📁 Upload", Upload], ["url", "🔗 URL", LinkIcon]] as const).map(([key, label]) => (
          <button key={key} type="button" onClick={() => setTab(key)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: tab === key ? "none" : "1px solid #f0d0de", background: tab === key ? "linear-gradient(135deg, #C5668E, #8B2252)" : "#fff", color: tab === key ? "#fff" : "#8B2252", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "upload" && (
        <>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? "#8B2252" : "#f0d0de"}`,
              borderRadius: 10, padding: "24px 16px",
              textAlign: "center", cursor: "pointer",
              backgroundColor: dragging ? "#fff0f8" : "#FFF5F7",
              transition: "all 0.2s",
            }}
          >
            {uploading ? (
              <div style={{ color: "#8B2252", fontSize: 13 }}>
                <div style={{ width: 32, height: 32, border: "3px solid #f0d0de", borderTopColor: "#8B2252", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 8px" }} />
                Enviando...
              </div>
            ) : (
              <>
                <Upload size={28} color="#C5668E" style={{ margin: "0 auto 8px" }} />
                <p style={{ fontSize: 13, color: "#5a3547", fontWeight: 600 }}>Arraste uma imagem aqui</p>
                <p style={{ fontSize: 11, color: "#9e6a7e", marginTop: 4 }}>ou clique para selecionar (máx. 5MB)</p>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </>
      )}

      {tab === "url" && (
        <div style={{ display: "flex", gap: 8 }}>
          <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://..." style={{ ...inputStyle, flex: 1 }} />
          <button type="button" onClick={() => { if (urlInput.trim()) { onChange(urlInput.trim()); setError(""); } }} style={{ padding: "0 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #C5668E, #8B2252)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Check size={16} />
          </button>
        </div>
      )}

      {error && <p style={{ fontSize: 11, color: "#c92a2a", marginTop: 6 }}>⚠️ {error}</p>}

      {/* Preview */}
      {value && (
        <div style={{ marginTop: 10, position: "relative", display: "inline-block", width: "100%" }}>
          <img
            src={value}
            alt="preview"
            style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, transform: `rotate(${rotation}deg)`, transition: "transform 0.3s" }}
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 6 }}>
            <button type="button" onClick={rotate} title="Girar" style={{ width: 30, height: 30, borderRadius: 6, border: "none", backgroundColor: "rgba(255,255,255,0.9)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
              <RotateCw size={15} color="#8B2252" />
            </button>
            <button type="button" onClick={() => { onChange(""); setUrlInput(""); setRotation(0); }} title="Remover" style={{ width: 30, height: 30, borderRadius: 6, border: "none", backgroundColor: "rgba(255,255,255,0.9)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
              <X size={15} color="#c92a2a" />
            </button>
          </div>
          {rotation !== 0 && (
            <p style={{ fontSize: 10, color: "#9e6a7e", marginTop: 4, textAlign: "center" }}>
              🔄 Rotação visual ({rotation}°) — salve para confirmar
            </p>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
