import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Hotspot, PeatlandZone } from "../lib/types";
import rawPeatlands from "../data/peatlands.json";
import { Wind, Radio, Compass, Flame, ShieldAlert, Sparkles } from "lucide-react";

interface LiveMapProps {
  hotspots: Hotspot[];
  selectedHotspot?: Hotspot | null;
  onSelectHotspot?: (hotspot: Hotspot) => void;
  className?: string;
  showLayersControl?: boolean;
}

export function LiveMap({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  className = "h-[500px] w-full",
  showLayersControl = true,
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const peatlandLayerRef = useRef<any>(null);

  const [showHotspots, setShowHotspots] = useState(true);
  const [showPeatlands, setShowPeatlands] = useState(true);
  const [baseLayerType, setBaseLayerType] = useState<"satellite" | "osm">("satellite");
  const [isClient, setIsClient] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "peatland">("all");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper to create dynamic HTML marker icons
  const createFireIcon = (L: any, h: Hotspot) => {
    let size = 18;
    let html = "";

    if (h.frp >= 20 || h.confidence === "high") {
      size = 32;
      html = `
        <div class="fire-marker-container" style="width: 32px; height: 32px;">
          <div class="fire-wave fire-wave-red" style="width: 30px; height: 30px;"></div>
          <div class="fire-wave fire-wave-orange" style="width: 22px; height: 22px; animation-delay: 0.6s;"></div>
          <div class="fire-core-flame" style="width: 14px; height: 14px; background: radial-gradient(circle, #fef08a 0%, #ef4444 85%); box-shadow: 0 0 14px rgba(239,68,68,1), 0 0 4px #fff; border: 1.5px solid #ffffff;"></div>
        </div>
      `;
    } else if (h.frp >= 10 || h.confidence === "nominal") {
      size = 24;
      html = `
        <div class="fire-marker-container" style="width: 24px; height: 24px;">
          <div class="fire-wave fire-wave-orange" style="width: 22px; height: 22px;"></div>
          <div class="fire-core-flame" style="width: 11px; height: 11px; background: radial-gradient(circle, #ffedd5 0%, #f97316 85%); box-shadow: 0 0 10px rgba(249,115,22,0.9); border: 1.5px solid #ffffff;"></div>
        </div>
      `;
    } else {
      size = 18;
      html = `
        <div class="fire-marker-container" style="width: 18px; height: 18px;">
          <div style="width: 8px; height: 8px; border-radius: 9999px; background: #eab308; box-shadow: 0 0 8px #eab308; border: 1.5px solid #ffffff; transition: transform 0.2s;"></div>
        </div>
      `;
    }

    return L.divIcon({
      html,
      className: "custom-fire-div-icon",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  // Helper to render Hotspots
  const renderHotspots = (
    L: any,
    group: any,
    spots: Hotspot[],
    visible: boolean,
    filterMode: "all" | "high" | "peatland",
    onSelect?: (h: Hotspot) => void
  ) => {
    group.clearLayers();
    if (!visible) return;

    let filteredSpots = spots;
    if (filterMode === "high") {
      filteredSpots = spots.filter((h) => h.frp >= 20 || h.confidence === "high");
    }

    // Render up to 750 high-priority spots for smooth 60fps interaction
    const displaySpots = filteredSpots.slice(0, 750);

    displaySpots.forEach((h) => {
      const icon = createFireIcon(L, h);
      const marker = L.marker([h.latitude, h.longitude], { icon });

      let badgeColor = "#eab308";
      if (h.frp >= 20 || h.confidence === "high") badgeColor = "#ef4444";
      else if (h.frp >= 10) badgeColor = "#f97316";

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #f4f4f5; padding: 12px; min-width: 230px; line-height: 1.4;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.15); pb-2;">
            <div style="display:flex; align-items:center; gap: 4px;">
              <span style="display:inline-block; width: 8px; height: 8px; border-radius: 9999px; background: ${badgeColor}; box-shadow: 0 0 8px ${badgeColor};"></span>
              <b style="color: #ffffff; font-size: 13px; font-family: monospace;">${h.id}</b>
            </div>
            <span style="background: ${badgeColor}33; color: ${badgeColor}; border: 1px solid ${badgeColor}66; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">
              ${h.confidence.toUpperCase()}
            </span>
          </div>

          <div style="margin-bottom: 8px; space-y: 4px;">
            <div style="display:flex; justify-content:space-between; font-size: 11px;">
              <span style="color: #a1a1aa;">Wilayah:</span>
              <b style="color: #ffffff;">${h.province}</b>
            </div>
            <div style="display:flex; justify-content:space-between; font-size: 11px;">
              <span style="color: #a1a1aa;">Koordinat:</span>
              <span style="color: #ffffff; font-family: monospace;">${h.latitude.toFixed(4)}, ${h.longitude.toFixed(4)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size: 11px;">
              <span style="color: #a1a1aa;">Intensitas Radiasi:</span>
              <b style="color: ${badgeColor}; font-family: monospace;">${h.frp} MW</b>
            </div>
            <div style="display:flex; justify-content:space-between; font-size: 11px;">
              <span style="color: #a1a1aa;">Suhu Termal Satelit:</span>
              <span style="color: #ffffff; font-family: monospace;">${h.bright_ti4} K (${(h.bright_ti4 - 273.15).toFixed(1)} °C)</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size: 11px;">
              <span style="color: #a1a1aa;">Waktu Rekam:</span>
              <span style="color: #a1a1aa; font-family: monospace;">${h.acq_date} ${h.acq_time} UTC</span>
            </div>
          </div>

          <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; margin-top: 6px;">
            <a href="/reports" style="display: flex; align-items:center; justify-content:center; gap: 6px; width: 100%; background: #ef4444; color: #ffffff; padding: 6px 10px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 700; box-shadow: 0 4px 10px rgba(239,68,68,0.4);">
              <span>🚨 Verifikasi & Tangani Titik Ini</span>
            </a>
          </div>
        </div>
      `);

      if (onSelect) {
        marker.on("click", () => onSelect(h));
      }

      group.addLayer(marker);
    });
  };

  // Helper to render Peatland polygons
  const renderPeatlands = (L: any, group: any) => {
    group.clearLayers();
    const peatlands = rawPeatlands as PeatlandZone[];

    peatlands.forEach((p) => {
      const polygon = L.polygon(p.coordinates, {
        color: "#f59e0b",
        fillColor: "#b45309",
        fillOpacity: 0.35,
        weight: 2,
        dashArray: "6, 6",
      });

      polygon.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #f4f4f5; padding: 10px; line-height: 1.4;">
          <b style="color: #f59e0b; font-size: 13px;">${p.name}</b><br/>
          <div style="margin-top: 4px; font-size: 11px; color: #a1a1aa;">
            <div><b>Provinsi:</b> ${p.province}</div>
            <div><b>Kedalaman Gambut:</b> ${p.depth_class}</div>
            <div><b>Luas Area:</b> ${(p.area_ha || 0).toLocaleString()} ha</div>
            <div><b>Stok Karbon Kritis:</b> ${p.carbon_density_ton_ha} ton C/ha</div>
          </div>
        </div>
      `);

      group.addLayer(polygon);
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Center: Kalimantan (-1.5, 114.0)
      const map = L.map(mapContainerRef.current!, {
        center: [-1.5, 114.0],
        zoom: 6,
        zoomControl: false,
      });

      L.control.zoom({ position: "topleft" }).addTo(map);

      // ESRI World Imagery (Real High-res satellite)
      const esriTile = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri &mdash; Maxar, Earthstar Geographics",
          maxZoom: 18,
        }
      );
      esriTile.addTo(map);
      tileLayerRef.current = esriTile;

      const peatlandsGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = markersGroup;
      peatlandLayerRef.current = peatlandsGroup;

      renderPeatlands(L, peatlandsGroup);
      renderHotspots(L, markersGroup, hotspots, showHotspots, activeFilter, onSelectHotspot);

      setLeafletLoaded(true);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient]);

  // Handle Base Layer Switch (Satellite vs OSM)
  const switchBaseLayer = (type: "satellite" | "osm") => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    setBaseLayerType(type);

    import("leaflet").then((L) => {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      if (type === "satellite") {
        const esri = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "Tiles &copy; Esri &mdash; Maxar, Earthstar Geographics",
            maxZoom: 18,
          }
        );
        esri.addTo(mapInstanceRef.current);
        tileLayerRef.current = esri;
      } else {
        const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          subdomains: ["a", "b", "c"],
        });
        osm.addTo(mapInstanceRef.current);
        tileLayerRef.current = osm;
      }
    });
  };

  // Update Hotspot Markers when hotspots change, filter changes, or visibility toggled
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !leafletLoaded) return;

    import("leaflet").then((L) => {
      renderHotspots(
        L,
        markersLayerRef.current,
        hotspots,
        showHotspots,
        activeFilter,
        onSelectHotspot
      );
    });
  }, [hotspots, showHotspots, activeFilter, leafletLoaded, onSelectHotspot]);

  // Center on selected hotspot with smooth flyTo animation
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedHotspot) return;
    mapInstanceRef.current.flyTo(
      [selectedHotspot.latitude, selectedHotspot.longitude],
      10,
      {
        duration: 1.4,
        easeLinearity: 0.25,
      }
    );
  }, [selectedHotspot]);

  // Toggle Peatland Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !peatlandLayerRef.current) return;
    if (showPeatlands) {
      if (!mapInstanceRef.current.hasLayer(peatlandLayerRef.current)) {
        mapInstanceRef.current.addLayer(peatlandLayerRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(peatlandLayerRef.current)) {
        mapInstanceRef.current.removeLayer(peatlandLayerRef.current);
      }
    }
  }, [showPeatlands]);

  const recenterKalimantan = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([-1.5, 114.0], 6, {
        duration: 1.2,
      });
    }
  };

  const zoomToProvince = (lat: number, lon: number, zoom: number = 7) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], zoom, {
        duration: 1.2,
      });
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Top Floating HUD: Live Radar Scan & Quick Filter Pills */}
      <div className="absolute top-3 left-12 z-[1000] flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-background/90 px-3 py-1.5 text-xs shadow-lg backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-bold text-foreground tracking-wide font-mono">VIIRS 375m THERMAL SCAN</span>
        </div>

        {/* Quick Filter Mode */}
        <div className="flex items-center rounded-lg border border-border/80 bg-background/90 p-1 text-xs shadow-md backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`rounded px-2.5 py-1 font-semibold transition ${
              activeFilter === "all"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua Titik ({hotspots.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("high")}
            className={`rounded px-2.5 py-1 font-semibold transition flex items-center gap-1 ${
              activeFilter === "high"
                ? "bg-red-600 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="h-3 w-3" />
            Prioritas Kritis (&gt;20 MW)
          </button>
        </div>
      </div>

      {/* Layer and Zoom Controls (Right Side) */}
      {showLayersControl && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          {/* Base Layer Switcher */}
          <div className="rounded-lg border border-border/80 bg-background/95 p-2 text-xs shadow-lg backdrop-blur-md">
            <p className="mb-1.5 font-semibold text-foreground">Tampilan Peta</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => switchBaseLayer("satellite")}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  baseLayerType === "satellite"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Satelit (ESRI)
              </button>
              <button
                type="button"
                onClick={() => switchBaseLayer("osm")}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  baseLayerType === "osm"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Peta Jalan (OSM)
              </button>
            </div>
          </div>

          {/* Overlays */}
          <div className="rounded-lg border border-border/80 bg-background/95 p-3 text-xs shadow-lg backdrop-blur-md">
            <p className="mb-2 font-semibold text-foreground">Layer Tematik</p>
            <div className="space-y-1.5">
              <label className="flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={showHotspots}
                  onChange={(e) => setShowHotspots(e.target.checked)}
                  className="rounded border-border accent-primary"
                />
                <span className="font-medium text-foreground">Hotspot Aktif (Live FIRMS)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={showPeatlands}
                  onChange={(e) => setShowPeatlands(e.target.checked)}
                  className="rounded border-border accent-accent"
                />
                <span className="font-medium text-foreground">Kawasan Gambut (KHG KLHK)</span>
              </label>
            </div>
          </div>

          {/* FRP Intensity Animated Legend */}
          <div className="rounded-lg border border-border/80 bg-background/95 p-3 text-xs shadow-lg backdrop-blur-md">
            <p className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Intensitas Radiasi (FRP)
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                </span>
                <span className="font-medium text-foreground">Kritis (&gt; 20 MW)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-50"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 border border-white"></span>
                </span>
                <span className="text-muted-foreground">Sedang (10 - 20 MW)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-yellow-400 border border-white ml-0.5" />
                <span className="text-muted-foreground">Rendah (&lt; 10 MW)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Province Quick Jump Smooth Bar */}
      <div className="absolute bottom-3 left-3 z-[1000] flex flex-wrap gap-1.5 rounded-lg border border-border/80 bg-background/95 p-1.5 text-xs shadow-lg backdrop-blur-md">
        <button
          onClick={recenterKalimantan}
          className="rounded px-2.5 py-1 font-semibold text-foreground transition hover:bg-muted"
        >
          Semua Kalimantan
        </button>
        <button
          onClick={() => zoomToProvince(-2.21, 113.92)}
          className="rounded px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground font-medium"
        >
          KalTeng
        </button>
        <button
          onClick={() => zoomToProvince(-0.02, 109.34)}
          className="rounded px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground font-medium"
        >
          KalBar
        </button>
        <button
          onClick={() => zoomToProvince(-3.32, 114.59)}
          className="rounded px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground font-medium"
        >
          KalSel
        </button>
        <button
          onClick={() => zoomToProvince(-0.50, 117.15)}
          className="rounded px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground font-medium"
        >
          KalTim
        </button>
        <button
          onClick={() => zoomToProvince(2.84, 117.37)}
          className="rounded px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground font-medium"
        >
          KalTara
        </button>
      </div>
    </div>
  );
}
