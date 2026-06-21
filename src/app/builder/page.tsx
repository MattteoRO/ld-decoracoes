"use client";

import { useState } from "react";
import { ArrowLeft, Check, ChevronRight, Wand2, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

const STEPS = ["Painel", "Mobiliário", "Cores & Tema"];

const MOCK_PANELS = [
  { id: "p1", name: "Painel Redondo", image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=200", price: 80 },
  { id: "p2", name: "Painel Romano", image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=200", price: 120 },
  { id: "p3", name: "Estrutura Quadrada", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=200", price: 100 },
];

const MOCK_FURNITURE = [
  { id: "f1", name: "Trio de Cilindros", image: "https://images.unsplash.com/photo-1550184658-c2a47291a240?auto=format&fit=crop&q=80&w=200", price: 150 },
  { id: "f2", name: "Mesas Rústicas", image: "https://images.unsplash.com/photo-1533299346856-b1a85808f2ec?auto=format&fit=crop&q=80&w=200", price: 180 },
  { id: "f3", name: "Mesas Transparentes", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=200", price: 200 },
];

const MOCK_THEMES = [
  { id: "t1", name: "Rose Gold Elegante", color: "#C5668E" },
  { id: "t2", name: "Azul Serenidade", color: "#87CEEB" },
  { id: "t3", name: "Verde Esmeralda", color: "#50C878" },
  { id: "t4", name: "Dourado Clássico", color: "#FFD700" },
];

type SelectionItem = { id: string; name: string; price?: number; image?: string; color?: string };

export default function BuilderPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [step, setStep] = useState(0);
  const [panel, setPanel] = useState<SelectionItem | null>(null);
  const [furniture, setFurniture] = useState<SelectionItem | null>(null);
  const [theme, setTheme] = useState<SelectionItem | null>(null);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  function selectPanel(item: SelectionItem) {
    setPanel(item);
    setTimeout(() => setStep(1), 350);
  }

  function selectFurniture(item: SelectionItem) {
    setFurniture(item);
    setTimeout(() => setStep(2), 350);
  }

  function selectTheme(item: SelectionItem) {
    setTheme(item);
  }

  function handleFinish() {
    if (!panel || !furniture || !theme) return;
    const total = (panel.price || 0) + (furniture.price || 0);
    const customKit = {
      id: `custom-${Date.now()}`,
      title: `Kit Personalizado (${theme.name})`,
      description: `Painel: ${panel.name}, Mobiliário: ${furniture.name}, Tema: ${theme.name}`,
      price: total,
      image: panel.image || "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=400",
      category: "Monte Sua Festa",
      includes: [panel.name, furniture.name, `Paleta de cores: ${theme.name}`],
    };
    addToCart(customKit);
    router.push("/orcamento");
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
    else router.back();
  }

  const canAdvance = (step === 0 && panel) || (step === 1 && furniture) || (step === 2 && theme);

  return (
    <main style={{ paddingBottom: 160, minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header style={{
        padding: '20px', backgroundColor: '#fff',
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 16,
        borderBottom: '1px solid var(--color-border)',
      }}>
        <button onClick={goBack} style={{
          background: 'none', border: 'none', color: 'var(--color-primary)',
          cursor: 'pointer', display: 'flex', padding: 8,
        }}>
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="font-serif" style={{ fontSize: 18, color: 'var(--color-text-main)' }}>Monte sua Festa</h1>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Passo {step + 1} de 3: {STEPS[step]}</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div style={{ display: 'flex', padding: '16px 20px', gap: 8 }}>
        {[0, 1, 2].map((s) => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 2,
            backgroundColor: s <= step ? 'var(--color-primary)' : 'var(--color-border)',
            transition: 'background-color 0.3s ease'
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '0 20px 24px' }}>

        {/* Step 1: Panel */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 16 }}>Escolha o Painel de Fundo</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {MOCK_PANELS.map(item => {
                const selected = panel?.id === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => selectPanel(item)}
                    style={{
                      backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
                      border: `2px solid ${selected ? 'var(--color-primary)' : 'transparent'}`,
                      boxShadow: 'var(--shadow-sm)', cursor: 'pointer', position: 'relative',
                      padding: 0, textAlign: 'left', display: 'block', width: '100%',
                    }}
                  >
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-main)' }}>{item.name}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', marginTop: 4 }}>+ {fmt(item.price)}</p>
                    </div>
                    {selected && (
                      <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--color-primary)', color: '#fff', borderRadius: '50%', padding: 4, display: 'flex' }}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Furniture */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 16 }}>Escolha o Mobiliário</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {MOCK_FURNITURE.map(item => {
                const selected = furniture?.id === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => selectFurniture(item)}
                    style={{
                      backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
                      border: `2px solid ${selected ? 'var(--color-primary)' : 'transparent'}`,
                      boxShadow: 'var(--shadow-sm)', cursor: 'pointer', position: 'relative',
                      padding: 0, textAlign: 'left', display: 'block', width: '100%',
                    }}
                  >
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-main)' }}>{item.name}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', marginTop: 4 }}>+ {fmt(item.price)}</p>
                    </div>
                    {selected && (
                      <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--color-primary)', color: '#fff', borderRadius: '50%', padding: 4, display: 'flex' }}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Theme */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-main)', marginBottom: 16 }}>Paleta de Cores</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_THEMES.map(item => {
                const selected = theme?.id === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => selectTheme(item)}
                    style={{
                      backgroundColor: '#fff', borderRadius: 14, padding: 16,
                      border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                      textAlign: 'left', width: '100%',
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: item.color, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 }} />
                    <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-main)', flex: 1 }}>{item.name}</span>
                    {selected && <Check size={20} color="var(--color-primary)" />}
                  </button>
                );
              })}
            </div>

            {/* Total */}
            <div style={{ marginTop: 32, padding: 20, backgroundColor: 'var(--color-surface)', borderRadius: 16, border: '1px dashed var(--color-primary)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <Package size={32} color="var(--color-primary)" />
              <div>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Total Estimado</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {fmt((panel?.price || 0) + (furniture?.price || 0))}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', borderTop: '1px solid var(--color-border)',
        padding: '16px 20px 32px', zIndex: 9999,
        boxShadow: '0 -4px 24px rgba(139,34,82,0.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {step < 2 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (step === 0 && panel) setStep(1);
                else if (step === 1 && furniture) setStep(2);
              }}
              style={{
                width: '100%', fontSize: 16, padding: '16px 28px',
                opacity: canAdvance ? 1 : 0.4,
                pointerEvents: canAdvance ? 'auto' : 'none',
              }}
            >
              Próximo Passo
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleFinish}
              style={{
                width: '100%', fontSize: 16, padding: '16px 28px',
                background: theme ? 'linear-gradient(135deg, #2b8a3e, #1a7a30)' : undefined,
                opacity: theme ? 1 : 0.4,
                pointerEvents: theme ? 'auto' : 'none',
              }}
            >
              <Wand2 size={18} />
              FINALIZAR KIT
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
