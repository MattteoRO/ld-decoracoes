"use client";

import { ArrowLeft, ShoppingCart, Check, Package, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/data/products";
import BottomNav from "@/components/BottomNav";

export default function BuilderClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--color-background)", paddingBottom: 100 }}>
      {/* Header */}
      <header style={{
        padding: "20px", backgroundColor: "#fff",
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", alignItems: "center", gap: 16,
        borderBottom: "1px solid var(--color-border)",
      }}>
        <button onClick={() => router.back()} style={{
          background: "none", border: "none", color: "var(--color-primary)",
          cursor: "pointer", display: "flex", padding: 4,
        }}>
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>
        <div>
          <h1 className="font-serif" style={{ fontSize: 18, color: "var(--color-text-main)" }}>
            Pegue e Monte
          </h1>
          <p style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Você é o decorador!</p>
        </div>
      </header>

      {/* Hero explicativo */}
      <div style={{
        margin: "16px",
        background: "linear-gradient(135deg, #C5668E, #8B2252)",
        borderRadius: 16,
        padding: "24px 20px",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -20, right: -20,
          width: 120, height: 120, borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.08)",
        }} />
        <div style={{
          position: "absolute", bottom: -30, right: 20,
          width: 80, height: 80, borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.06)",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
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
          {[
            "✨ Peças premium do tema escolhido",
            "🚗 Retire na nossa loja já montado",
            "🎨 Você decora do seu jeito",
            "💰 Valor mais acessível",
          ].map((item, i) => (
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
            { num: "2", text: "Solicite o orçamento via WhatsApp" },
            { num: "3", text: "Combine a data de retirada na loja" },
            { num: "4", text: "Decore e surpreenda todo mundo!" },
          ].map(step => (
            <div key={step.num} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg, #C5668E, #8B2252)",
                color: "#fff", fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>{step.num}</div>
              <p style={{ fontSize: 13, color: "var(--color-text-main)" }}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Produtos */}
      <div style={{ padding: "0 16px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-main)", marginBottom: 12 }}>
          Kits Disponíveis
        </h3>

        {products.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px 20px",
            color: "var(--color-text-muted)", backgroundColor: "#fff",
            borderRadius: 14, border: "1px solid var(--color-border)",
          }}>
            <Star size={40} strokeWidth={1} style={{ color: "var(--color-primary-light)", marginBottom: 12 }} />
            <p style={{ fontSize: 14 }}>Em breve novos kits disponíveis!</p>
            <p style={{ fontSize: 12, marginTop: 6 }}>Fale com a gente pelo WhatsApp.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {products.map(product => {
              const inCart = isInCart(product.id);
              return (
                <div key={product.id} style={{
                  backgroundColor: "#fff", borderRadius: 16,
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)", overflow: "hidden",
                }}>
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{ width: "100%", height: 200, objectFit: "cover" }}
                  />
                  <div style={{ padding: "16px" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-main)", marginBottom: 4 }}>
                      {product.title}
                    </h4>
                    <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: 12 }}>
                      {product.description}
                    </p>

                    {product.includes.length > 0 && (
                      <div style={{ marginBottom: 12, padding: "10px 12px", backgroundColor: "var(--color-background-alt)", borderRadius: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary)", marginBottom: 6 }}>INCLUI:</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {product.includes.map((inc, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-main)" }}>
                              <Check size={12} color="var(--color-primary)" strokeWidth={2.5} />
                              {inc}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {product.price > 0 ? (
                        <span style={{ fontSize: 18, fontWeight: 700, color: "var(--color-primary)" }}>
                          {fmt(product.price)}
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontStyle: "italic" }}>
                          Consultar preço
                        </span>
                      )}
                      <button
                        onClick={() => { addToCart(product); router.push("/orcamento"); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "10px 18px", borderRadius: 10, border: "none",
                          background: inCart
                            ? "linear-gradient(135deg, #2b8a3e, #1a7a30)"
                            : "linear-gradient(135deg, #C5668E, #8B2252)",
                          color: "#fff", fontSize: 13, fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {inCart ? <Check size={16} strokeWidth={2.5} /> : <ShoppingCart size={16} strokeWidth={2} />}
                        {inCart ? "No orçamento" : "Solicitar"}
                      </button>
                    </div>
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
