"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, ClipboardList } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const navItems = [
    { href: "/", label: "Início", icon: Home },
    { href: "/catalog", label: "Categorias", icon: LayoutGrid },
    { href: "/orcamento", label: "Orçamento", icon: ShoppingBag, badge: cartCount },
    { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, width: '100%', maxWidth: 1200,
      backgroundColor: '#FFFFFF', borderTop: '1px solid #F0D6DE',
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 20px', zIndex: 50,
      boxShadow: '0 -4px 20px rgba(139,34,82,0.06)',
    }}>
      {navItems.map(item => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: isActive ? '#8B2252' : '#9B7082',
            fontSize: 10, textDecoration: 'none', position: 'relative',
          }}>
            <div style={{ position: 'relative', display: 'flex' }}>
              <Icon size={22} strokeWidth={1.5} />
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  backgroundColor: '#8B2252', color: 'white',
                  borderRadius: '50%', minWidth: 16, height: 16,
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {item.badge}
                </span>
              )}
            </div>
            <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

  return (
    <nav style={{
      position: 'fixed', bottom: 0, width: '100%', maxWidth: 1200,
      backgroundColor: '#FFFFFF', borderTop: '1px solid #F0D6DE',
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 20px', zIndex: 50,
      boxShadow: '0 -4px 20px rgba(139,34,82,0.06)',
    }}>
      {navItems.map(item => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: isActive ? '#8B2252' : '#9B7082',
            fontSize: 10, textDecoration: 'none', position: 'relative',
          }}>
            <div style={{ position: 'relative', display: 'flex' }}>
              <Icon size={22} strokeWidth={1.5} />
              {item.badge && item.badge > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  backgroundColor: '#8B2252', color: 'white',
                  borderRadius: '50%', minWidth: 16, height: 16,
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {item.badge}
                </span>
              )}
            </div>
            <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
