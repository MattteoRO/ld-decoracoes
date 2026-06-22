"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ArrowLeft, Package, Boxes, ToggleLeft, ToggleRight, X } from "lucide-react";
import type { DbItem, DbKit } from "@/lib/supabase";

const ITEM_CATEGORIES = [
  "Moveis", "EST-PNL-150", "EST-CIL-JOG", "EST-PNL-MAD-120",
  "EST-PNL-MAD-50", "EST-PNL-ACO-50", "EST-ARC-VAZ", "EST-ARC-MAD",
  "EST-PORT-3D", "Tapetes", "Temas",
];

type Tab = "items" | "kits";
type ItemForm = { id?: string; sku: string; name: string; category: string; is_available: boolean };
type KitItemRow = { category_needed: string | null; specific_sku: string | null; quantity: number };
type KitForm = { id?: string; name: string; description: string; image: string; price: string; active: boolean; kit_items: KitItemRow[] };

const emptyItem = (): ItemForm => ({ sku: "", name: "", category: ITEM_CATEGORIES[0], is_available: true });
const emptyKit = (): KitForm => ({ name: "", description: "", image: "", price: "", active: true, kit_items: [] });

interface Props {
  initialItems: DbItem[];
  initialKits: DbKit[];
}

export default function InventoryClient({ initialItems, initialKits }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("items");
  const [items, setItems] = useState<DbItem[]>(initialItems);
  const [kits, setKits] = useState<DbKit[]>(initialKits);

  // Item form state
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItem());
  const [savingItem, setSavingItem] = useState(false);

  // Kit form state
  const [showKitForm, setShowKitForm] = useState(false);
  const [kitForm, setKitForm] = useState<KitForm>(emptyKit());
  const [savingKit, setSavingKit] = useState(false);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadItems() {
    const res = await fetch("/api/admin/inventory?type=items");
    if (res.ok) setItems(await res.json());
  }

  async function loadKits() {
    const res = await fetch("/api/admin/inventory?type=kits");
    if (res.ok) setKits(await res.json());
  }

  // ── Item handlers ──────────────────────────────────────────
  async function handleSaveItem() {
    if (!itemForm.sku.trim() || !itemForm.name.trim()) {
      showToast("SKU e nome são obrigatórios.", false); return;
    }
    setSavingItem(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "item", ...itemForm }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast(itemForm.id ? "Item atualizado!" : "Item criado!");
        setShowItemForm(false);
        await loadItems();
      } else { showToast(data.error || "Erro ao salvar.", false); }
    } catch { showToast("Erro de conexão.", false); }
    finally { setSavingItem(false); }
  }

  async function handleDeleteItem(id: string) {
    if (!confirm("Remover este item do acervo?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "item", id }),
      });
      const data = await res.json();
      if (data.ok) { showToast("Item removido."); await loadItems(); }
      else { showToast(data.error || "Erro ao remover.", false); }
    } catch { showToast("Erro de conexão.", false); }
    finally { setDeletingId(null); }
  }

  // ── Kit handlers ───────────────────────────────────────────
  async function handleSaveKit() {
    if (!kitForm.name.trim()) { showToast("Nome do kit é obrigatório.", false); return; }
    setSavingKit(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "kit",
          ...kitForm,
          price: kitForm.price ? parseFloat(kitForm.price) : null,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast(kitForm.id ? "Kit atualizado!" : "Kit criado!");
        setShowKitForm(false);
        await loadKits();
      } else { showToast(data.error || "Erro ao salvar.", false); }
    } catch { showToast("Erro de conexão.", false); }
    finally { setSavingKit(false); }
  }

  async function handleDeleteKit(id: string) {
    if (!confirm("Remover este kit?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "kit", id }),
      });
      const data = await res.json();
      if (data.ok) { showToast("Kit removido."); await loadKits(); }
      else { showToast(data.error || "Erro ao remover.", false); }
    } catch { showToast("Erro de conexão.", false); }
    finally { setDeletingId(null); }
  }

  function addKitItem() {
    setKitForm(f => ({ ...f, kit_items: [...f.kit_items, { category_needed: ITEM_CATEGORIES[1], specific_sku: null, quantity: 1 }] }));
  }

  function updateKitItem(i: number, field: keyof KitItemRow, value: string | number | null) {
    setKitForm(f => {
      const arr = [...f.kit_items];
      arr[i] = { ...arr[i], [field]: value };
      return { ...f, kit_items: arr };
    });
  }

  function removeKitItem(i: number) {
    setKitForm(f => ({ ...f, kit_items: f.kit_items.filter((_, idx) => idx !== i) }));
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#FFF5F7", paddingBottom: 40 }}>
      {/* Header */}
      <header style={{ backgroundColor: "#fff", padding: "16px 20px", borderBottom: "1px solid #f0d0de", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 20, boxShadow: "0 2px 8px rgba(139,34,82,0.06)" }}>
        <button onClick={() => router.push("/admin/dashboard")} style={{ background: "none", border: "none", color: "#8B2252", cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, color: "#8B2252" }}>Acervo & Kits</h1>
          <p style={{ fontSize: 11, color: "#9e6a7e" }}>{items.length} itens · {kits.length} kits</p>
        </div>
      </header>

      <div style={{ padding: "20px 16px", maxWidth: 640, margin: "0 auto" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {([["items", "Acervo (SKUs)", Package], ["kits", "Kits", Boxes]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: tab === key ? "none" : "1px solid #f0d0de", background: tab === key ? "linear-gradient(135deg, #C5668E, #8B2252)" : "#fff", color: tab === key ? "#fff" : "#8B2252", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* ── ITEMS TAB ── */}
        {tab === "items" && (
          <>
            <button onClick={() => { setItemForm(emptyItem()); setShowItemForm(true); }} style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(135deg, #C5668E, #8B2252)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", marginBottom: 16, boxShadow: "0 4px 16px rgba(139,34,82,0.2)" }}>
              <Plus size={20} /> Adicionar Item ao Acervo
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map(item => (
                <div key={item.id} style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid #f0d0de", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, opacity: item.is_available ? 1 : 0.55 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#3d1f2e" }}>{item.sku}</p>
                    <p style={{ fontSize: 12, color: "#5a3547" }}>{item.name}</p>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999, backgroundColor: "#fff0f8", color: "#8B2252", border: "1px solid #f5c0d8" }}>{item.category}</span>
                    {!item.is_available && <span style={{ fontSize: 10, marginLeft: 6, color: "#c92a2a", fontWeight: 600 }}>🔴 Inativo</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => { setItemForm({ id: item.id, sku: item.sku, name: item.name, category: item.category, is_available: item.is_available }); setShowItemForm(true); }} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #f0d0de", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B2252" }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} disabled={deletingId === item.id} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #ffc9c9", backgroundColor: "#fff0f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#c92a2a" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {items.length === 0 && <p style={{ textAlign: "center", color: "#b592a1", marginTop: 40 }}>Nenhum item no acervo.</p>}
          </>
        )}

        {/* ── KITS TAB ── */}
        {tab === "kits" && (
          <>
            <button onClick={() => { setKitForm(emptyKit()); setShowKitForm(true); }} style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(135deg, #C5668E, #8B2252)", color: "#fff", border: "none", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", marginBottom: 16, boxShadow: "0 4px 16px rgba(139,34,82,0.2)" }}>
              <Plus size={20} /> Criar Kit
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {kits.map(kit => (
                <div key={kit.id} style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid #f0d0de", padding: "12px 14px", opacity: kit.active ? 1 : 0.55 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#3d1f2e" }}>{kit.name}</p>
                      {kit.description && <p style={{ fontSize: 12, color: "#5a3547", marginTop: 2 }}>{kit.description}</p>}
                      <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center" }}>
                        {kit.price && kit.price > 0
                          ? <p style={{ fontSize: 13, fontWeight: 700, color: "#8B2252" }}>R$ {kit.price.toFixed(2).replace(".", ",")}</p>
                          : <p style={{ fontSize: 12, color: "#b592a1", fontStyle: "italic" }}>Sem preço</p>
                        }
                        <p style={{ fontSize: 11, color: "#9e6a7e" }}>· {kit.kit_items?.length ?? 0} componentes</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { setKitForm({ id: kit.id, name: kit.name, description: kit.description ?? "", image: kit.image ?? "", price: kit.price ? String(kit.price) : "", active: kit.active, kit_items: (kit.kit_items ?? []).map(ki => ({ category_needed: ki.category_needed, specific_sku: ki.specific_sku, quantity: ki.quantity })) }); setShowKitForm(true); }} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #f0d0de", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B2252" }}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDeleteKit(kit.id)} disabled={deletingId === kit.id} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #ffc9c9", backgroundColor: "#fff0f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#c92a2a" }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  {kit.kit_items && kit.kit_items.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f5e0ea" }}>
                      {kit.kit_items.map((ki, i) => (
                        <span key={i} style={{ display: "inline-block", fontSize: 10, padding: "2px 8px", backgroundColor: "#fff0f8", border: "1px solid #f5c0d8", borderRadius: 999, color: "#8B2252", marginRight: 4, marginBottom: 4 }}>
                          {ki.specific_sku ?? ki.category_needed}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {kits.length === 0 && <p style={{ textAlign: "center", color: "#b592a1", marginTop: 40 }}>Nenhum kit cadastrado.</p>}
          </>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", backgroundColor: toast.ok ? "#2b8a3e" : "#c92a2a", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 100, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", whiteSpace: "nowrap" }}>
          {toast.msg}
        </div>
      )}

      {/* ── Item Form Modal ── */}
      {showItemForm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "flex-end" }} onClick={(e) => { if (e.target === e.currentTarget) setShowItemForm(false); }}>
          <div style={{ backgroundColor: "#fff", width: "100%", maxWidth: 640, margin: "0 auto", borderRadius: "20px 20px 0 0", maxHeight: "90vh", overflow: "auto", padding: "24px 20px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, color: "#8B2252" }}>{itemForm.id ? "Editar Item" : "Novo Item do Acervo"}</h2>
              <button onClick={() => setShowItemForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B2252" }}><X size={22} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="SKU *"><input value={itemForm.sku} onChange={e => setItemForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))} placeholder="Ex: EST-PNL-150-06" style={inputStyle} disabled={!!itemForm.id} /></Field>
              <Field label="Nome *"><input value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Painel redondo 1.50m #06" style={inputStyle} /></Field>
              <Field label="Categoria *">
                <select value={itemForm.category} onChange={e => setItemForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                  {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", backgroundColor: "#FFF5F7", borderRadius: 10, border: "1px solid #f0d0de" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#5a3547" }}>Item disponível (ativo)</span>
                <button type="button" onClick={() => setItemForm(f => ({ ...f, is_available: !f.is_available }))} style={{ background: "none", border: "none", cursor: "pointer", color: itemForm.is_available ? "#2b8a3e" : "#b592a1", display: "flex" }}>
                  {itemForm.is_available ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
              <button onClick={handleSaveItem} disabled={savingItem} style={{ padding: 14, borderRadius: 10, border: "none", background: savingItem ? "#d4a0b5" : "linear-gradient(135deg, #C5668E, #8B2252)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: savingItem ? "not-allowed" : "pointer" }}>
                {savingItem ? "Salvando..." : itemForm.id ? "Salvar Alterações" : "Criar Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Kit Form Modal ── */}
      {showKitForm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "flex-end" }} onClick={(e) => { if (e.target === e.currentTarget) setShowKitForm(false); }}>
          <div style={{ backgroundColor: "#fff", width: "100%", maxWidth: 640, margin: "0 auto", borderRadius: "20px 20px 0 0", maxHeight: "92vh", overflow: "auto", padding: "24px 20px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, color: "#8B2252" }}>{kitForm.id ? "Editar Kit" : "Novo Kit"}</h2>
              <button onClick={() => setShowKitForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B2252" }}><X size={22} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Nome do Kit *"><input value={kitForm.name} onChange={e => setKitForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Kit Masha e o Urso" style={inputStyle} /></Field>
              <Field label="Descrição">
                <textarea value={kitForm.description} onChange={e => setKitForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="O que está incluso no kit..." style={{ ...inputStyle, resize: "vertical" }} />
              </Field>
              <Field label="Imagem (URL ou /produtos/nome-do-arquivo.jpeg)">
                <input value={kitForm.image} onChange={e => setKitForm(f => ({ ...f, image: e.target.value }))} placeholder="Ex: /produtos/natural-boho.jpeg" style={inputStyle} />
                {kitForm.image && (
                  <img src={kitForm.image} alt="preview" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginTop: 6 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
              </Field>
              <Field label="Preço (R$)"><input type="number" min="0" step="0.01" value={kitForm.price} onChange={e => setKitForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" style={inputStyle} /></Field>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", backgroundColor: "#FFF5F7", borderRadius: 10, border: "1px solid #f0d0de" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#5a3547" }}>Kit ativo</span>
                <button type="button" onClick={() => setKitForm(f => ({ ...f, active: !f.active }))} style={{ background: "none", border: "none", cursor: "pointer", color: kitForm.active ? "#2b8a3e" : "#b592a1", display: "flex" }}>
                  {kitForm.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>

              {/* Kit Items / BOM */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#5a3547", marginBottom: 8 }}>Componentes do Kit</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {kitForm.kit_items.map((ki, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <select value={ki.specific_sku ? "specific" : "category"} onChange={e => updateKitItem(i, e.target.value === "specific" ? "specific_sku" : "category_needed", e.target.value === "specific" ? "" : ITEM_CATEGORIES[1])} style={{ ...inputStyle, flex: "0 0 110px", fontSize: 11, padding: "10px 8px" }}>
                        <option value="category">Categoria</option>
                        <option value="specific">SKU fixo</option>
                      </select>
                      {ki.specific_sku !== null ? (
                        <input value={ki.specific_sku} onChange={e => updateKitItem(i, "specific_sku", e.target.value.toUpperCase())} placeholder="SKU exato" style={{ ...inputStyle, flex: 1 }} />
                      ) : (
                        <select value={ki.category_needed ?? ""} onChange={e => updateKitItem(i, "category_needed", e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                          {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}
                      <button onClick={() => removeKitItem(i)} style={{ width: 34, height: 44, borderRadius: 8, border: "1px solid #ffc9c9", backgroundColor: "#fff0f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#c92a2a", flexShrink: 0 }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addKitItem} style={{ marginTop: 8, padding: "8px 14px", borderRadius: 8, border: "1px dashed #C5668E", backgroundColor: "#FFF5F7", color: "#8B2252", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Plus size={14} /> Adicionar componente
                </button>
              </div>

              <button onClick={handleSaveKit} disabled={savingKit} style={{ padding: 14, borderRadius: 10, border: "none", background: savingKit ? "#d4a0b5" : "linear-gradient(135deg, #C5668E, #8B2252)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: savingKit ? "not-allowed" : "pointer" }}>
                {savingKit ? "Salvando..." : kitForm.id ? "Salvar Alterações" : "Criar Kit"}
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
