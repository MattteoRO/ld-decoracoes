"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MapPin, Search, X, Loader2 } from "lucide-react";

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

interface Props {
  value?: LocationData | null;
  onChange: (loc: LocationData | null) => void;
  hasError?: boolean;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

export default function LocationPicker({ value, onChange, hasError }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [pin, setPin] = useState<LocationData | null>(value ?? null);
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMap = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  // Load Leaflet CSS once
  useEffect(() => {
    if (document.getElementById("leaflet-css")) return;
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  const initMap = useCallback(async () => {
    if (!mapRef.current || leafletMap.current) return;

    // Dynamically import leaflet
    const L = (await import("leaflet")).default;

    // Fix default icon paths broken by webpack
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const center: [number, number] = pin ? [pin.lat, pin.lng] : [-11.4, -61.5]; // Rondônia
    const map = L.map(mapRef.current).setView(center, pin ? 15 : 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    if (pin) {
      markerRef.current = L.marker([pin.lat, pin.lng]).addTo(map);
    }

    map.on("click", async (e: { latlng: { lat: number; lng: number } }) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }
      // Reverse geocode
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        const address = data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        const loc = { address, lat, lng };
        setPin(loc);
      } catch {
        const loc = { address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng };
        setPin(loc);
      }
    });

    leafletMap.current = map;
  }, [pin]);

  useEffect(() => {
    if (open) {
      // Small delay to ensure the container is rendered
      setTimeout(() => initMap(), 100);
    } else {
      // Cleanup map on close
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markerRef.current = null;
      }
    }
  }, [open, initMap]);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=br`
      );
      const data = await res.json();
      setSearchResults(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.map((r: any) => ({
          address: r.display_name,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
        }))
      );
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function selectResult(loc: LocationData) {
    setPin(loc);
    setSearchResults([]);
    setQuery("");
    if (leafletMap.current) {
      leafletMap.current.setView([loc.lat, loc.lng], 16);
      if (markerRef.current) {
        markerRef.current.setLatLng([loc.lat, loc.lng]);
      } else {
        import("leaflet").then(({ default: L }) => {
          markerRef.current = L.marker([loc.lat, loc.lng]).addTo(leafletMap.current);
        });
      }
    }
  }

  function confirm() {
    if (pin) {
      onChange(pin);
      setOpen(false);
    }
  }

  function clear() {
    onChange(null);
    setPin(null);
    setOpen(false);
  }

  const borderColor = hasError ? "#c92a2a" : "var(--color-border)";

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 10,
          border: `1px solid ${borderColor}`,
          backgroundColor: value ? "#f0fff4" : "var(--color-background)",
          color: value ? "#1b5e20" : "var(--color-text-muted)",
          fontSize: 13, fontFamily: "inherit", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10, textAlign: "left",
        }}
      >
        <MapPin size={16} color={value ? "#2b8a3e" : "var(--color-primary)"} />
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value ? value.address : "Clique para selecionar o local no mapa"}
        </span>
        {value && (
          <X size={14} onClick={(e) => { e.stopPropagation(); clear(); }} style={{ color: "#c92a2a", flexShrink: 0 }} />
        )}
      </button>

      {/* Modal */}
      {open && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 200, display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{ backgroundColor: "#fff", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0d0de" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={20} color="#8B2252" />
              <span style={{ fontWeight: 700, color: "#8B2252", fontSize: 16 }}>Local da Festa</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B2252" }}>
              <X size={22} />
            </button>
          </div>

          {/* Search bar */}
          <div style={{ backgroundColor: "#fff", padding: "12px 16px", borderBottom: "1px solid #f0d0de" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Buscar endereço, bairro, cidade..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #f0d0de", fontSize: 14, fontFamily: "inherit", backgroundColor: "#FFF5F7" }}
              />
              <button onClick={handleSearch} disabled={searching} style={{ padding: "0 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #C5668E, #8B2252)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
                {searching ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={16} />}
                Buscar
              </button>
            </div>
            <p style={{ fontSize: 11, color: "#9e6a7e", marginTop: 6 }}>
              💡 Ou clique direto no mapa para marcar o local
            </p>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div style={{ marginTop: 8, border: "1px solid #f0d0de", borderRadius: 8, overflow: "hidden", maxHeight: 200, overflowY: "auto" }}>
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => selectResult(r)} style={{ width: "100%", padding: "10px 14px", border: "none", borderBottom: i < searchResults.length - 1 ? "1px solid #f5e0ea" : "none", backgroundColor: "#fff", cursor: "pointer", textAlign: "left", fontSize: 12, color: "#3d1f2e", display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <MapPin size={14} color="#8B2252" style={{ flexShrink: 0, marginTop: 2 }} />
                    {r.address}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div ref={mapRef} style={{ flex: 1 }} />

          {/* Footer */}
          <div style={{ backgroundColor: "#fff", padding: "12px 16px", borderTop: "1px solid #f0d0de", display: "flex", gap: 10 }}>
            {pin && (
              <div style={{ flex: 1, padding: "10px 12px", backgroundColor: "#f0fff4", borderRadius: 8, border: "1px solid #8ce99a", fontSize: 12, color: "#1b5e20", display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={14} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pin.address}</span>
              </div>
            )}
            <button
              onClick={confirm}
              disabled={!pin}
              style={{ flexShrink: 0, padding: "10px 20px", borderRadius: 8, border: "none", background: pin ? "linear-gradient(135deg, #C5668E, #8B2252)" : "#d4a0b5", color: "#fff", fontWeight: 600, fontSize: 14, cursor: pin ? "pointer" : "not-allowed" }}
            >
              Confirmar Local
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
