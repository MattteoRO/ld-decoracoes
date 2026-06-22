"use client";

import { ArrowLeft, Package, Star, Calendar, CheckCircle2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import AvailabilityChecker from "@/components/AvailabilityChecker";
import type { DbKit } from "@/lib/supabase";
import { useState } from "react";

const WHATSAPP_NUMBER = "5569992693194";

const KIT_IMAGES: Record<string, string> = {
  "Kit Princesas Disney":  "/produtos/15-anos-classica-roxo-prata.jpeg",
  "Kit Patrulha Canina":   "/produtos/aniversario-tropical-colorida.png",
  "Kit Masha e o Urso":    "/produtos/natural-boho.jpeg",
  "Kit Boteco":            "/produtos/earthly-gold.jpeg",
  "Kit Stitch":            "/produtos/deep-blue-gold.jpeg",
  "Kit Minnie Mouse":      "/produtos/classic-pink-cristal.png",
  "Kit Debutante":         "/produtos/soft-rose-gold.jpeg",
  "Kit Carros":            "/produtos/fortune-tiger.jpeg",
  "Kit Dragon Ball Z":     "/produtos/sonic-luxo-azul-dourado.jpeg",
  "Kit Astronauta":        "/produtos/vibrant-purple.png",
};

const KIT_DESCRIPTIONS: Record<string, string> = {
  "Kit Princesas Disney":  "Painel sublimado + cilindros decorados + capas, vasos e bandejas temáticas.",
  "Kit Patrulha Canina":   "Painel sublimado + cilindros decorados + capas e acessórios Patrulha Canina Rosa.",
  "Kit Masha e o Urso":    "Painel sublimado + cilindros + cerca, vasos e suportes da Masha.",
  "Kit Boteco":            "Painel sublimado + cilindros + capas de chopp/tijolinho, vasos e bandejas.",
  "Kit Stitch":            "Painel sublimado + cilindros + capas, vasos rosas e suportes roxos.",
  "Kit Minnie Mouse":      "Painel sublimado + cilindros + capas poá, vasos e bandejas da Minnie.",
  "Kit Debutante":         "Painel sublimado + cilindros + capa redonda e arranjos florais.",
  "Kit Carros":            "Painel sublimado + cilindros + capas pista/pneu e suportes temáticos.",
  "Kit Dragon Ball Z":     "Painel sublimado + cilindros + capas e suportes Dragon Ball Z.",
  "Kit Astronauta":        "Painel sublimado + cilindros + capas e suportes coloridos de astronauta.",
};

export default function BuilderClient({ kits }: { kits: DbKit[] }) {
  const router = useRouter();
  const [expandedKit, setExpandedKit] = useState<string | null>(null);
  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  function handleWhatsApp(kitName: string) {
    const msg = encodeURIComponent(
      `🎀 Olá! Tenho interesse no *${kitName}* (Pegue e Monte).\nGostaria de saber disponibilidade e valor. 😊`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-background)", paddingBottom: 100 }}>
      {/* Header */}
      <header style={{ padding: "20px", backgroundColor: "#fff", position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid var(--color-border)" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", display: "flex", padding: 4 }}>
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>
        <div>
          <h1 className="font-serif" style={{ fontSize: 18, color: "var(--color-text-main)" }}>Pegue e Monte</h1>
          <p style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Você é o decorador!</p>
        </div>
      </header>

      {/* Hero */}
      <div style={{ margin: "16px", background: "linear-gradient(135deg, #C5668E, #8B2252)", borderRadius: 16, padding: "24px 20px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -30, right: 20, width: 80, height: 80, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.06)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Package size={22} color="#fff" />
          </div>
          <div>
            <h2 className="font-serif" style={{ fontSize: 18, fontWeight: 700 }}>Modalidade Pegue e Monte</h2>
            <p style={{ fontSize: 11, opacity: 0.85 }}>Você é o decorador!</p>
          </div>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.95 }}>
          Nessa modalidade, <strong>você é o decorador!</strong> Nós disponibilizamos todas as peças lindas do tema escolhido, e você fica responsável por dar vida à festa.
        </p>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {["✨ Peças premium do tema escolhido", "🚗 Retire na nossa loja já montado", "🎨 Você decora do seu jeito", "💰 Valor mais acessível"].map((item, i) => (
            <div key={i} style={{ fontSize: 13, opacity: 0.95 }}>{item}</div>
          ))}
        </div>
      </div>

      {/* Como funciona */}
      <div style={{ margin: "0 16px 16px", padding: "16px", backgroundColor: "#fff", borderRadius: 14, border: "1px solid var(--color-border)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary)", marginBottom: 12 }}>Como funciona?</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { num: "1", text: "Escolha o kit do tema que você quer" },
            { num: "2", text: "Verifique a disponibilidade na data da festa" },
            { num: "3", text: "Solicite o orçamento via WhatsApp" },
            { num: "4", text: "Retire na loja e decore do seu jeito!" },
          ].map(step => (
            <div key={step.num} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #C5668E, #8B2252)", color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step.num}</div>
              <p style={{ fontSize: 13, color: "var(--color-text-main)" }}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kits */}
      <div style={{ padding: "0 16px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-main)", marginBottom: 12 }}>
          Kits Disponíveis
        </h3>

        {kits.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--color-text-muted)", backgroundColor: "#fff", borderRadius: 14, border: "1px solid var(--color-border)" }}>
            <Star size={40} strokeWidth={1} style={{ color: "var(--color-primary-light)", marginBottom: 12 }} />
            <p style={{ fontSize: 14 }}>Em breve novos kits disponíveis!</p>
            <p style={{ fontSize: 12, marginTop: 6 }}>Fale com a gente pelo WhatsApp.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {kits.map(kit => {
              const image = KIT_IMAGES[kit.name];
              const description = kit.description ?? KIT_DESCRIPTIONS[kit.name] ?? "";
              const isExpanded = expandedKit === kit.id;

              return (
                <div key={kit.id} style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
                  {/* Imagem */}
                  {image && (
                    <img src={image} alt={kit.name} style={{ width: "100%", height: 200, objectFit: "cover" }} />
                  )}

                  <div style={{ padding: 16 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-main)", marginBottom: 6 }}>{kit.name}</h4>
                    {description && (
                      <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 12 }}>{description}</p>
                    )}

                    {/* Componentes do kit */}
                    {kit.kit_items && kit.kit_items.length > 0 && (
                      <div style={{ marginBottom: 14, padding: "10px 12px", backgroundColor: "var(--color-background-alt)", borderRadius: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary)", marginBottom: 6 }}>INCLUI:</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {kit.kit_items.map((ki, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-main)" }}>
                              <CheckCircle2 size={12} color="var(--color-primary)" strokeWidth={2.5} />
                              {ki.specific_sku ?? ki.category_needed}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preço */}
                    {kit.price && kit.price > 0 ? (
                      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--color-primary)", marginBottom: 12 }}>
                        {fmt(kit.price)}
                      </p>
                    ) : (
                      <p style={{ fontSize: 13, color: "var(--color-text-muted)", fontStyle: "italic", marginBottom: 12 }}>
                        Consultar preço via WhatsApp
                      </p>
                    )}

                    {/* Verificar disponibilidade (toggle) */}
                    <button
                      onClick={() => setExpandedKit(isExpanded ? null : kit.id)}
                      style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid var(--color-border)", backgroundColor: "var(--color-background-alt)", color: "var(--color-primary)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: isExpanded ? 12 : 0 }}
                    >
                      <Calendar size={16} />
                      {isExpanded ? "Fechar verificação" : "Verificar disponibilidade"}
                    </button>

                    {isExpanded && <AvailabilityChecker kitId={kit.id} />}

                    {/* Botão WhatsApp */}
                    <button
                      onClick={() => handleWhatsApp(kit.name)}
                      style={{ width: "100%", marginTop: 10, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #25D366, #128C7E)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                      <MessageCircle size={18} />
                      Solicitar via WhatsApp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
