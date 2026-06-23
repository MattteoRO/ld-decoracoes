"use client";

import { Search, ShoppingBag, PartyPopper, Gift, Crown, Balloon, ListChecks, Phone, ShoppingCart, Check, Wand2 } from "lucide-react";
import styles from "./page.module.css";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/products";

const CATEGORIES = [
  { id: 0, name: "Monte Sua Festa", icon: <Wand2 size={22} strokeWidth={1.5} />, isBuilder: true },
  { id: 1, name: "Locação", icon: <PartyPopper size={22} strokeWidth={1.5} /> },
  { id: 2, name: "Kit Festa", icon: <Gift size={22} strokeWidth={1.5} /> },
  { id: 3, name: "Kit Premium", icon: <Crown size={22} strokeWidth={1.5} /> },
  { id: 4, name: "Balões", icon: <Balloon size={22} strokeWidth={1.5} /> },
  { id: 5, name: "Temas", icon: <ListChecks size={22} strokeWidth={1.5} /> },
];

export default function HomeClient({ products }: { products: Product[] }) {
  const { addToCart, isInCart, cartCount } = useCart();
  const router = useRouter();

  return (
    <main className={`animate-fade-in ${styles.main}`}>
      {/* Header */}
      <header className={styles.appHeader}>
        <div className={styles.headerTop}>
          <div className={styles.logoGroup}>
            <span className={`font-serif ${styles.logoIcon}`}>LD</span>
            <div className={styles.logoText}>
              <span className={`font-serif ${styles.logoTitle}`}>DECORAÇÕES</span>
              <span className={styles.logoSub}>TRANSFORMANDO SONHOS EM FESTAS!</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/orcamento" className={styles.iconButton} style={{ position: "relative" }}>
              <ShoppingBag size={24} strokeWidth={1.5} color="#8B2252" />
              {cartCount > 0 && <span className={styles.headerBadge}>{cartCount}</span>}
            </Link>
          </div>
        </div>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} strokeWidth={1.5} />
          <input type="text" placeholder="Buscar produtos, kits e mais..." className={styles.searchInput} />
        </div>
      </header>

      {/* Hero Banner */}
      <section className={styles.heroSection}>
        <img src="https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&q=80&w=600&h=400" alt="Decoração de Festa" className={styles.heroImage} />
        <div className={styles.heroOverlay}>
          <h2 className={`font-serif ${styles.heroTitle}`}>Decorações que<br />encantam!</h2>
          <Link href="/catalog" className={styles.heroButton}>VER COLEÇÃO</Link>
        </div>
      </section>

      {/* Categories */}
      <div className={styles.categoriesWrapper}>
        {CATEGORIES.map(cat => (
          <Link href={cat.isBuilder ? "/builder" : `/catalog?cat=${encodeURIComponent(cat.name)}`} key={cat.id} className={styles.categoryCard}>
            <div className={styles.categoryIcon}>{cat.icon}</div>
            <span className={styles.categoryName}>{cat.name}</span>
          </Link>
        ))}
      </div>

      {/* Products */}
      <div className={styles.sectionHeader}>
        <h2 className={`font-serif ${styles.sectionTitle}`}>Mais Procurados</h2>
        <Link href="/catalog" className={styles.sectionLink}>Ver todos</Link>
      </div>

      <div className={styles.productsGrid}>
        {products.map(product => (
          <div
            key={product.id}
            className={styles.productCard}
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/produto/${product.id}`)}
          >
            <img src={product.image} alt={product.title} className={styles.productImage} />
            <div className={styles.productInfo}>
              <span className={styles.productTitle}>{product.title}</span>
              <span className={styles.productPrice}>
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
              </span>
            </div>
            <button
              className={`${styles.cartButton} ${isInCart(product.id) ? styles.cartButtonAdded : ""}`}
              onClick={(e) => { e.stopPropagation(); if (!isInCart(product.id)) addToCart(product); router.push("/orcamento"); }}
              aria-label={`Adicionar ${product.title} ao orçamento`}
            >
              {isInCart(product.id) ? <Check size={18} strokeWidth={2.5} /> : <ShoppingCart size={18} strokeWidth={2} />}
            </button>
          </div>
        ))}
      </div>

      {/* WhatsApp Banner */}
      <a href="https://wa.me/5569992693194" target="_blank" rel="noopener noreferrer" className={styles.whatsappBanner}>
        <Phone size={22} strokeWidth={2} />
        <div>
          <div className={styles.whatsappText}>ATENDIMENTO</div>
          <div className={styles.whatsappNumber}>69 99269 3194</div>
        </div>
      </a>

      <BottomNav />
    </main>
  );
}
