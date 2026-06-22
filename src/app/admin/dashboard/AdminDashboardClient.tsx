"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, LogOut, Package, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, X, Check, Boxes, CalendarCheck, FileText } from "lucide-react";
import type { DbProduct } from "@/lib/supabase";
import ImageUploader from "@/components/ImageUploader";
import SortableIncludes from "@/components/SortableIncludes";

const CATEGORIES = ["Locação", "Kit Festa", "Kit Premium", "Balões", "Pegue e Monte", "Temas Personalizados", "Monte Sua Festa"];

type ProductForm = {
  id?: string;
  title: string;
  price: string;
  image: string;
  category: string;
  description: string;
  active: boolean;
  sort_order: number;
  includes: string[];
};

const emptyForm = (): ProductForm => ({
  title: "",
  price: "",
  image: "",
  category: CATEGORIES[0],
  description: "",
  active: true,
  sort_order: 0,
  includes: [""],
});

export default function AdminDashboardClient({ initialProducts }: { initialProducts: DbProduct[] }) {
  const router = useRouter();
  const [products, setProducts] = useState<DbProduct[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    if (res.ok) setProducts(await res.json());
  }

  function openCreate() {
    setForm(emptyForm());
    setShowForm(true);
  }

  function openEdit(p: DbProduct) {
    setForm({
      id: p.id,
      title: p.title,
      price: String(p.price),
      image: p.image,
      category: p.category,
      description: p.description,
      active: p.active,
      sort_order: p.sort_order,
      includes: p.includes?.length ? p.includes.sort((a, b) => a.sort_order - b.sort_order).map(i => i.name) : [""],
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.price || !form.category) {
      showToast("Preencha nome, preço e categoria.", false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          includes: form.includes.filter(i => i.trim()),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast(form.id ? "Produto atualizado!" : "Produto criado!");
        setShowForm(false);
        await loadProducts();
      } else {
        showToast(data.error || "Erro ao salvar.", false);
      }
    } catch {
      showToast("Erro de conexão.", false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este produto?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast("Produto removido.");
        await loadProducts();
      } else {
        showToast(data.error || "Erro ao remover.", false);
      }
    } catch {
      showToast("Erro de conexão.", false);
    } finally {
      setDeletingId(null);
    }
  }

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#FFF5F7", paddingBottom: 40 }}>
      {/* Header */}
      <header style={{
        backgroundColor: "#fff", padding: "16px 20px",
        borderBottom: "1px solid #f0d0de",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 20,
        boxShadow: "0 2px 8px rgba(139,34,82,0.06)",
      }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, color: "#8B2252" }}>
            LD Admin
          </h1>
          <p style={{ fontSize: 11, color: "#9e6a7e" }}>{products.length} produtos cadastrados</p>
        </div>
        <button onClick={logout} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "1px solid #f0d0de", borderRadius: 8,
          padding: "8px 12px", cursor: "pointer", color: "#8B2252", fontSize: 13,
        }}>
          <LogOut size={16} />
          Sair
        </button>
      </header>

      <div style={{ padding: "20px 16px", maxWidth: 640, margin: "0 auto" }}>
        {/* Quick nav */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <button onClick={() => router.push("/admin/orcamentos")} style={{ flex: 1, minWidth: 120, padding: "10px", borderRadius: 10, border: "1px solid #f0d0de", backgroundColor: "#fff", color: "#8B2252", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <FileText size={16} /> Orçamentos
          </button>
          <button onClick={() => router.push("/admin/inventory")} style={{ flex: 1, minWidth: 120, padding: "10px", borderRadius: 10, border: "1px solid #f0d0de", backgroundColor: "#fff", color: "#8B2252", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Boxes size={16} /> Acervo & Kits
          </button>
          <button onClick={() => router.push("/admin/reservations")} style={{ flex: 1, minWidth: 120, padding: "10px", borderRadius: 10, border: "1px solid #f0d0de", backgroundColor: "#fff", color: "#8B2252", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <CalendarCheck size={16} /> Reservas
          </button>
        </div>

        {/* Add button */}
        <button
          onClick={openCreate}
          style={{
            width: "100%", padding: "14px", borderRadius: 12,
            background: "linear-gradient(135deg, #C5668E, #8B2252)",
            color: "#fff", border: "none", fontSize: 15, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: "pointer", marginBottom: 20,
            boxShadow: "0 4px 16px rgba(139,34,82,0.2)",
          }}
        >
          <Plus size={20} />
          Adicionar Produto
        </button>

        {/* Product list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {products.map(p => (
            <div key={p.id} style={{
              backgroundColor: "#fff", borderRadius: 14,
              border: "1px solid #f0d0de",
              boxShadow: "0 2px 8px rgba(139,34,82,0.04)",
              overflow: "hidden",
              opacity: p.active ? 1 : 0.6,
            }}>
              {/* Product row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                <img src={p.image} alt={p.title} style={{
                  width: 56, height: 56, borderRadius: 10, objectFit: "cover",
                  flexShrink: 0, backgroundColor: "#f5d0e0",
                }} onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/56x56?text=?"; }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#3d1f2e", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.title}
                  </p>
                  <p style={{ fontSize: 13, color: "#8B2252", fontWeight: 700 }}>{fmt(p.price)}</p>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 8px",
                    borderRadius: 999, backgroundColor: "#fff0f8", color: "#8B2252",
                    border: "1px solid #f5c0d8", display: "inline-block", marginTop: 2,
                  }}>
                    {p.category}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} style={{
                    width: 34, height: 34, borderRadius: 8, border: "1px solid #f0d0de",
                    backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B2252",
                  }}>
                    {expandedId === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button onClick={() => openEdit(p)} style={{
                    width: 34, height: 34, borderRadius: 8, border: "1px solid #f0d0de",
                    backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B2252",
                  }}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} style={{
                    width: 34, height: 34, borderRadius: 8, border: "1px solid #ffc9c9",
                    backgroundColor: "#fff0f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#c92a2a",
                  }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Expanded includes */}
              {expandedId === p.id && (
                <div style={{ padding: "0 14px 14px", borderTop: "1px solid #f5e0ea" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#8B2252", marginBottom: 8, marginTop: 10 }}>
                    SUBPRODUTOS ({p.includes?.length ?? 0})
                  </p>
                  {p.includes && p.includes.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {p.includes.sort((a, b) => a.sort_order - b.sort_order).map(inc => (
                        <div key={inc.id} style={{ fontSize: 13, color: "#5a3547", display: "flex", alignItems: "center", gap: 6 }}>
                          <Check size={12} color="#8B2252" />
                          {inc.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: "#b592a1" }}>Nenhum subproduto.</p>
                  )}
                  <p style={{ fontSize: 11, color: "#b592a1", marginTop: 8 }}>
                    {p.active ? "✅ Visível no site" : "🔴 Oculto no site"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#b592a1" }}>
            <Package size={48} strokeWidth={1} style={{ marginBottom: 12, color: "#d4a0b5" }} />
            <p>Nenhum produto ainda. Clique em "Adicionar Produto" para começar.</p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          backgroundColor: toast.ok ? "#2b8a3e" : "#c92a2a",
          color: "#fff", padding: "12px 20px", borderRadius: 10,
          fontSize: 14, fontWeight: 500, zIndex: 100,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          whiteSpace: "nowrap",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 50, display: "flex", alignItems: "flex-end",
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{
            backgroundColor: "#fff", width: "100%", maxWidth: 640,
            margin: "0 auto", borderRadius: "20px 20px 0 0",
            maxHeight: "92vh", overflow: "auto",
            padding: "24px 20px 40px",
          }}>
            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, color: "#8B2252" }}>
                {form.id ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B2252" }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Title */}
              <Field label="Nome do produto *">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Kit Festa Premium" style={inputStyle} />
              </Field>

              {/* Price */}
              <Field label="Preço (R$) *">
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" style={inputStyle} />
              </Field>

              {/* Category */}
              <Field label="Categoria *">
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              {/* Image */}
              <Field label="Imagem">
                <ImageUploader
                  value={form.image}
                  onChange={url => setForm(f => ({ ...f, image: url }))}
                />
              </Field>

              {/* Description */}
              <Field label="Descrição">
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descreva o produto..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </Field>

              {/* Active */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", backgroundColor: "#FFF5F7", borderRadius: 10, border: "1px solid #f0d0de" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#5a3547" }}>Visível no site</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))} style={{ background: "none", border: "none", cursor: "pointer", color: form.active ? "#2b8a3e" : "#b592a1", display: "flex" }}>
                  {form.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>

              {/* Includes / Subprodutos */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#5a3547", marginBottom: 8 }}>
                  Subprodutos inclusos <span style={{ fontWeight: 400, color: "#9e6a7e" }}>(arraste para reordenar)</span>
                </label>
                <SortableIncludes
                  items={form.includes}
                  onChange={includes => setForm(f => ({ ...f, includes }))}
                />
              </div>

              {/* Save */}
              <button onClick={handleSave} disabled={saving} style={{
                padding: "14px", borderRadius: 10, border: "none",
                background: saving ? "#d4a0b5" : "linear-gradient(135deg, #C5668E, #8B2252)",
                color: "#fff", fontSize: 15, fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer", marginTop: 8,
              }}>
                {saving ? "Salvando..." : form.id ? "Salvar Alterações" : "Criar Produto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#5a3547", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px",
  borderRadius: 10, border: "1px solid #f0d0de",
  fontSize: 14, fontFamily: "inherit", outline: "none",
  backgroundColor: "#FFF5F7", color: "#3d1f2e",
  boxSizing: "border-box",
};
