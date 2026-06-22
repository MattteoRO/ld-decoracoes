"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push("/admin/dashboard");
      } else {
        setError("Usuário ou senha incorretos.");
      }
    } catch {
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "#FFF5F7", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 380, backgroundColor: "#fff",
        borderRadius: 20, padding: 32, boxShadow: "0 4px 32px rgba(139,34,82,0.1)",
        border: "1px solid #f5d0e0",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #C5668E, #8B2252)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Lock size={28} color="#fff" strokeWidth={1.5} />
          </div>
          <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 22, color: "#8B2252", marginBottom: 4 }}>
            LD Decorações
          </h1>
          <p style={{ fontSize: 13, color: "#9e6a7e" }}>Painel Administrativo</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Username */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#5a3547", marginBottom: 6 }}>
              Usuário
            </label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#b592a1" }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
                style={{
                  width: "100%", padding: "12px 16px 12px 40px",
                  borderRadius: 10, border: "1px solid #f0d0de",
                  fontSize: 14, fontFamily: "inherit", outline: "none",
                  backgroundColor: "#FFF5F7", color: "#3d1f2e",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#5a3547", marginBottom: 6 }}>
              Senha
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#b592a1" }} />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                style={{
                  width: "100%", padding: "12px 44px 12px 40px",
                  borderRadius: 10, border: "1px solid #f0d0de",
                  fontSize: 14, fontFamily: "inherit", outline: "none",
                  backgroundColor: "#FFF5F7", color: "#3d1f2e",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#b592a1", display: "flex" }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", backgroundColor: "#fff0f6", color: "#c92a2a", borderRadius: 8, fontSize: 13, border: "1px solid #ffc9c9" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px", borderRadius: 10, border: "none",
              background: loading ? "#d4a0b5" : "linear-gradient(135deg, #C5668E, #8B2252)",
              color: "#fff", fontSize: 15, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 8,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
