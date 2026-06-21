"use client";

import { Search, ShoppingCart, Check } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { products } from "@/data/products";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const ALL_CATEGORIES = ["Todos", "Locação", "Kit Festa", "Kit Premium", "Pegue e Monte", "Balões", "Temas Personalizados"];

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCat = searchParams.get("cat") || "";
  const [search, setSearch] = useState(initialCat);
  const [activeFilter, setActiveFilter] = useState(initialCat || "Todos");
  const { addToCart, isInCart } = useCart();

  const filteredProducts = products.filter(p => {
    if (activeFilter !== "Todos") {
      return p.category.toLowerCase().includes(activeFilter.toLowerCase());
    }
    if (search && search !== "Todos") {
      return p.title.toLowerCase().includes(search.toLowerCase()) ||
             p.category.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const handleFilter = (cat: string) => {
    setActiveFilter(cat);
    setSearch(cat === "Todos" ? "" : cat);
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <main className="animate-fade-in" style={{ paddingBottom: 90, minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header style={{
        padding: '20px 20px 12px', backgroundColor: '#fff',
        position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '1px solid var(--color-border)',
      }}>
        <h1 className="font-serif" style={{ fontSize: 20, color: 'var(--color-text-main)', marginBottom: 12 }}>Catálogo</h1>
        
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} strokeWidth={1.5} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou categoria..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveFilter("Todos"); }}
            style={{
              width: '100%', padding: '12px 16px 12px 44px',
              borderRadius: 999, border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)', fontFamily: 'inherit',
              fontSize: 13, outline: 'none', color: 'var(--color-text-main)',
            }}
          />
        </div>
        
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 0 4px',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {ALL_CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => handleFilter(cat)}
              style={{ 
                padding: '7px 16px', borderRadius: 999, 
                border: activeFilter === cat ? 'none' : '1px solid var(--color-border)',
                background: activeFilter === cat ? 'linear-gradient(135deg, #C5668E, #8B2252)' : '#fff',
                color: activeFilter === cat ? 'white' : 'var(--color-text-main)',
                fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Products */}
      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
        {filteredProducts.length > 0 ? filteredProducts.map(product => (
          <div 
            key={product.id} 
            onClick={() => {
              if (!isInCart(product.id)) {
                addToCart(product);
              }
              router.push("/orcamento");
            }}
            style={{
              backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
              border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)',
              display: 'flex', flexDirection: 'column', position: 'relative',
              cursor: 'pointer'
            }}
          >
            <img src={product.image} alt={product.title} style={{
              width: '100%', aspectRatio: '1', objectFit: 'cover',
            }} />
            <div style={{ padding: '10px 12px 12px' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-main)', lineHeight: 1.3, display: 'block', minHeight: 32 }}>
                {product.title}
              </span>
              <span style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 700 }}>
                {fmt(product.price)}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isInCart(product.id)) {
                  addToCart(product);
                }
                router.push("/orcamento");
              }}
              style={{
                position: 'absolute', bottom: 56, right: 8,
                width: 44, height: 44, borderRadius: '50%',
                background: isInCart(product.id)
                  ? 'linear-gradient(135deg, #2b8a3e, #1a7a30)'
                  : 'linear-gradient(135deg, #C5668E, #8B2252)',
                color: 'white', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: 'var(--shadow-md)',
                zIndex: 20, touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label={`Adicionar ${product.title}`}
            >
              {isInCart(product.id) ? <Check size={18} strokeWidth={2.5} /> : <ShoppingCart size={18} strokeWidth={2} />}
            </button>
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 20px', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: 14 }}>Nenhum produto encontrado.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Carregando...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
