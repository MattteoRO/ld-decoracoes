"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import { getProductById } from "@/data/products";
import { ArrowLeft, CheckCircle2, ShoppingCart, Check, Calendar, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const product = getProductById(id);
  const { addToCart, isInCart } = useCart();

  if (!product) return notFound();

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const inCart = isInCart(product.id);

  return (
    <main className="animate-fade-in" style={{ paddingBottom: 100, minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Back button overlay */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{
          backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)',
          border: 'none', width: 40, height: 40, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-primary)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
        }}>
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
      </div>

      {/* Layout Wrapper */}
      <div className="product-detail-layout">
        {/* Product Image */}
        <div className="product-image-container" style={{ width: '100%', aspectRatio: '1', position: 'relative', backgroundColor: 'var(--color-border)' }}>
        <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Content */}
      <div className="product-info-container" style={{
        padding: '24px 20px', backgroundColor: '#fff',
        borderRadius: '24px 24px 0 0', marginTop: -24,
        position: 'relative', boxShadow: '0 -4px 16px rgba(0,0,0,0.05)',
      }}>
        <span style={{
          backgroundColor: 'var(--color-background-alt)', color: 'var(--color-primary)',
          padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
          display: 'inline-block', marginBottom: 12,
        }}>
          {product.category}
        </span>

        <h1 className="font-serif" style={{ fontSize: 24, color: 'var(--color-text-main)', marginBottom: 8, lineHeight: 1.2 }}>
          {product.title}
        </h1>

        <div style={{ fontSize: 24, color: 'var(--color-primary)', fontWeight: 700, marginBottom: 24 }}>
          {fmt(product.price)}
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: 'var(--color-text-main)' }}>Descrição</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6 }}>{product.description}</p>
        </div>

        {/* Check Availability Mock */}
        <div style={{ marginBottom: 24, padding: 16, backgroundColor: 'var(--color-background-alt)', borderRadius: 14, border: '1px dashed var(--color-primary-light)' }}>
           <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
             <Calendar size={18} />
             Verificar Disponibilidade
           </h2>
           <div style={{ display: 'flex', gap: 8 }}>
             <input type="date" style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14, fontFamily: 'inherit' }} />
             <button style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 8, padding: '0 16px', fontWeight: 600, cursor: 'pointer' }}>
               Checar
             </button>
           </div>
        </div>

        {/* Includes */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-main)' }}>O que inclui:</h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {product.includes.map((item, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: 'var(--color-text-main)', lineHeight: 1.4 }}>
                <CheckCircle2 size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} strokeWidth={2} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reviews Mock */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-main)' }}>Festas Reais ⭐</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             {[
               { name: "Juliana Costa", date: "12 Mar 2026", rating: 5, text: "O painel é lindo! Deixou a festa da minha filha maravilhosa. Recomendo muito!" },
               { name: "Amanda Ferreira", date: "05 Fev 2026", rating: 5, text: "Material de altíssima qualidade, fácil de montar e as cores são exatamente como na foto." }
             ].map((review, i) => (
                <div key={i} style={{ padding: 16, backgroundColor: 'var(--color-background)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-main)' }}>{review.name}</span>
                      <div style={{ display: 'flex', gap: 2 }}>
                         {[...Array(review.rating)].map((_, idx) => <Star key={idx} size={14} fill="var(--gold-accent)" color="var(--gold-accent)" />)}
                      </div>
                   </div>
                   <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{review.text}</p>
                   <span style={{ fontSize: 11, color: '#b592a1' }}>Alugado em: {review.date}</span>
                </div>
             ))}
          </div>
        </div>
      </div>
      </div>

      {/* Fixed Bottom Button */}
      <div style={{
        position: 'fixed', bottom: 0, width: '100%', maxWidth: 1200,
        backgroundColor: '#fff', borderTop: '1px solid var(--color-border)',
        padding: '16px 20px 24px', zIndex: 50,
        boxShadow: '0 -4px 24px rgba(139,34,82,0.06)',
      }}>
        <button
          className="btn-primary"
          onClick={() => { addToCart(product); router.push("/orcamento"); }}
          style={{ fontSize: 15 }}
        >
          {inCart ? <Check size={20} strokeWidth={2.5} /> : <ShoppingCart size={20} strokeWidth={2} />}
          {inCart ? "JÁ ADICIONADO - VER ORÇAMENTO" : "ADICIONAR AO ORÇAMENTO"}
        </button>
      </div>
    </main>
  );
}
