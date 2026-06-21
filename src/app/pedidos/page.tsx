"use client";

import { ClipboardList } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function PedidosPage() {
  return (
    <main className="animate-fade-in" style={{ paddingBottom: 90, minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <header style={{
        padding: '20px', backgroundColor: '#fff',
        position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '1px solid var(--color-border)',
      }}>
        <h1 className="font-serif" style={{ fontSize: 20, color: 'var(--color-text-main)' }}>Meus Pedidos</h1>
      </header>

      <div style={{
        padding: '64px 20px', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        color: 'var(--color-text-muted)',
      }}>
        <ClipboardList size={56} strokeWidth={1} style={{ color: 'var(--color-primary-light)' }} />
        <p style={{ fontSize: 15 }}>Você ainda não tem pedidos.</p>
        <p style={{ fontSize: 13 }}>Após enviar um orçamento pelo WhatsApp, seus pedidos aparecerão aqui.</p>
      </div>

      <BottomNav />
    </main>
  );
}
