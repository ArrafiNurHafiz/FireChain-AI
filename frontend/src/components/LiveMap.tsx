import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Hotspot, PeatlandZone } from "../lib/types";
import rawPeatlands from "../data/peatlands.json";
import { Flame, Sparkles, Zap } from "lucide-react";

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
  const canvasRendererRef = useRef<any>(null);
  const canvasLayerRef = useRef<any>(null);
  const pulseLayerRef = useRef<any>(null);
  const peatlandLayerRef = useRef<any>(null);

  const [showHotspots, setShowHotspots] = useState(true);
  const [showPeatlands, setShowPeatlands] = useState(true);
  const [showRadarPulse, setShowRadarPulse] = useState(true);
  const [baseLayerType, setBaseLayerType] = useState<"satellite" | "osm">("satellite");
  const [isClient, setIsClient] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "critical">("all");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // High-performance Canvas Batch Renderer (0 DOM Overhead)
  const renderCanvasHotspots = (
    L: any,
    canvasGroup: any,
    pulseGroup: any,
    spots: Hotspot[],
    visible: boolean,
    isCriticalOnly: boolean,
    allowPulse: boolean,
    onSelect?: (h: Hotspot) => void
  ) => {
    canvasGroup.clearLayers();
    pulseGroup.clearLayers();
    if (!visible) return;

    const renderer = canvasRendererRef.current || L.canvas({ padding: 0.3 });

    let activeSpots = spots;
    if (isCriticalOnly) {
      activeSpots = spots.filter((h) => h.frp >= 20 || h.confidence === "high");
    }

    // 1. Render all points onto a single GPU Canvas (0 DOM elements!)
    activeSpots.forEach((h) => {
      let color = "#eab308";
      let radius = 3;
      let opacity = 0.75;

      if (h.frp >= 20 || h.confidence === "high") {
        color = "#ef4444";
        radius = 5.5;
        opacity = 0.95;
      } else if (h.frp >= 10 || h.confidence === "nominal") {
        color = "#f97316";
        radius = 4;
        opacity = 0.85;
      }

      const marker = L.circleMarker([h.latitude, h.longitude], {
        renderer,
        radius,
        fillColor: color,
        color: "#ffffff",
        weight: 1,
        fillOpacity: opacity,
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #f4f4f5; padding: 12px; min-width: 220px; line-height: 1.4;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px;">
            <b style="color: #ffffff; font-size: 13px; font-family: monospace;">${h.id}</b>
            <span style="background: ${color}33; color: ${color}; border: 1px solid ${color}66; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">
              ${h.confidence.toUpperCase()}
            </span>
          </div>
          <div style="font-size: 11px; space-y: 3px;">
            <div><span style="color:#a1a1aa;">Provinsi:</span> <b>${h.province}</b></div>
            <div><span style="color:#a1a1aa;">Koordinat:</span> <span style="font-family: monospace;">${h.latitude.toFixed(4)}, ${h.longitude.toFixed(4)}</span></div>
            <div><span style="color:#a1a1aa;">Radiasi FRP:</span> <b style="color: ${color}; font-family: monospace;">${h.frp} MW</b></div>
            <div><span style="color:#a1a1aa;">Suhu Termal:</span> <span style="font-family: monospace;">${h.bright_ti4} K (${(h.bright_ti4 - 273.15).toFixed(1)} °C)</span></div>
            <div><span style="color:#a1a1aa;">Waktu Rekam:</span> <span style="font-family: monospace;">${h.acq_date} ${h.acq_time} UTC</span></div>
          </div>
          <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; margin-top: 6px;">
            <a href="/reports" style="display: block; text-align: center; background: #ef4444; color: #fff; padding: 5px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: 700;">
              🚨 Tangani Titik Ini
            </a>
          </div>
        </div>
      `);

      if (onSelect) {
        marker.on("click", () => onSelect(h));
      }

      canvasGroup.addLayer(marker);
    });

    // 2. ONLY the top 5 most critical fires get the pulsing radar wave (super lightweight: only 5 DOM elements!)
    if (allowPulse) {
      const topCritical = activeSpots
        .filter((h) => h.frp >= 25 || h.confidence === "high")
        .slice(0, 5);

      topCritical.forEach((h) => {
        const pulseIcon = L.divIcon({
          className: "top-critical-pulse",
          html: `
            <div class="fire-marker-container" style="width: 24px; height: 24px; pointer-events: none;">
              <div class="fire-wave fire-wave-red" style="width: 24px; height: 24px;"></div>
              <div style="width: 8px; height: 8px; border-radius: 9999px; background: #ffffff; box-shadow: 0 0 10px #ef4444;"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const pulseMarker = L.marker([h.latitude, h.longitude], {
          icon: pulseIcon,
          interactive: false,
        });

        pulseGroup.addLayer(pulseMarker);
      });
    }
  };

  // Helper to render Peatlands
  const renderPeatlands = (L: any, group: any) => {
    group.clearLayers();
    const renderer = canvasRendererRef.current || L.canvas({ padding: 0.3 });
    const peatlands = rawPeatlands as PeatlandZone[];

    peatlands.forEach((p) => {
      const polygon = L.polygon(p.coordinates, {
        renderer,
        color: "#f59e0b",
        fillColor: "#b45309",
        fillOpacity: 0.3,
        weight: 1.5,
        dashArray: "4, 4",
      });

      polygon.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #f4f4f5; padding: 8px; line-height: 1.4;">
          <b style="color: #f59e0b; font-size: 13px;">${p.name}</b><br/>
          <div style="margin-top: 4px; font-size: 11px; color: #a1a1aa;">
            <div><b>Provinsi:</b> ${p.province}</div>
            <div><b>Kedalaman:</b> ${p.depth_class}</div>
            <div><b>Luas:</b> ${(p.area_ha || 0).toLocaleString()} ha</div>
            <div><b>Stok Karbon:</b> ${p.carbon_density_ton_ha} ton C/ha</div>
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

      // Enable Hardware-accelerated Canvas renderer
      const canvasRenderer = L.canvas({ padding: 0.3 });
      canvasRendererRef.current = canvasRenderer;

      const map = L.map(mapContainerRef.current!, {
        center: [-1.5, 114.0],
        zoom: 6,
        zoomControl: false,
        preferCanvas: true, // Native canvas rendering for ultra performance
      });

      L.control.zoom({ position: "topleft" }).addTo(map);

      // ESRI World Imagery (High-res satellite)
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
      const canvasGroup = L.layerGroup().addTo(map);
      const pulseGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      canvasLayerRef.current = canvasGroup;
      pulseLayerRef.current = pulseGroup;
      peatlandLayerRef.current = peatlandsGroup;

      renderPeatlands(L, peatlandsGroup);
      renderCanvasHotspots(
        L,
        canvasGroup,
        pulseGroup,
        hotspots,
        showHotspots,
        filterMode === "critical",
        showRadarPulse,
        onSelectHotspot
      );

      setLeafletLoaded(true);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient]);

  // Handle Base Layer Switch
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

  // Update Canvas Markers when hotspots change or filter changes
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !canvasLayerRef.current ||
      !pulseLayerRef.current ||
      !leafletLoaded
    )
      return;

    import("leaflet").then((L) => {
      renderCanvasHotspots(
        L,
        canvasLayerRef.current,
        pulseLayerRef.current,
        hotspots,
        showHotspots,
        filterMode === "critical",
        showRadarPulse,
        onSelectHotspot
      );
    });
  }, [hotspots, showHotspots, filterMode, showRadarPulse, leafletLoaded, onSelectHotspot]);

  // Center on selected hotspot
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedHotspot) return;
    mapInstanceRef.current.flyTo(
      [selectedHotspot.latitude, selectedHotspot.longitude],
      10,
      {
        duration: 0.8,
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
        duration: 0.8,
      });
    }
  };

  const zoomToProvince = (lat: number, lon: number, zoom: number = 7) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], zoom, {
        duration: 0.8,
      });
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Top Floating HUD: Fast Filter & Canvas Mode */}
      <div className="absolute top-3 left-12 z-[1000] flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-background/90 px-2.5 py-1 text-xs shadow-lg backdrop-blur-md">
          <Zap className="h-3.5 w-3.5 text-yellow-500" />
          <span className="font-bold text-foreground tracking-wide font-mono text-[11px]">
            CANVAS 60FPS
          </span>
        </div>

        {/* Quick Filter */}
        <div className="flex items-center rounded-lg border border-border/80 bg-background/90 p-1 text-xs shadow-md backdrop-blur-md">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`rounded px-2.5 py-1 font-semibold transition text-xs ${
              filterMode === "all"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({hotspots.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("critical")}
            className={`rounded px-2.5 py-1 font-semibold transition flex items-center gap-1 text-xs ${
              filterMode === "critical"
                ? "bg-red-600 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="h-3 w-3" />
            Critical (&gt;20 MW)
          </button>
        </div>
      </div>

      {/* Layer and Zoom Controls (Right Side) */}
      {showLayersControl && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          {/* Base Layer Switcher */}
          <div className="rounded-lg border border-border/80 bg-background/95 p-2 text-xs shadow-lg backdrop-blur-md">
            <p className="mb-1 font-semibold text-foreground text-[11px]">Base Layer</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => switchBaseLayer("satellite")}
                className={`rounded px-2 py-1 font-medium transition text-[11px] ${
                  baseLayerType === "satellite"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Satellite (ESRI)
              </button>
              <button
                type="button"
                onClick={() => switchBaseLayer("osm")}
                className={`rounded px-2 py-1 font-medium transition text-[11px] ${
                  baseLayerType === "osm"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                OSM Streets
              </button>
            </div>
          </div>

          {/* Overlays */}
          <div className="rounded-lg border border-border/80 bg-background/95 p-2.5 text-xs shadow-lg backdrop-blur-md">
            <p className="mb-1.5 font-semibold text-foreground text-[11px]">Layers & Overlays</p>
            <div className="space-y-1">
              <label className="flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground text-[11px]">
                <input
                  type="checkbox"
                  checked={showHotspots}
                  onChange={(e) => setShowHotspots(e.target.checked)}
                  className="rounded border-border accent-primary"
                />
                <span className="font-medium text-foreground">FIRMS Hotspots</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground text-[11px]">
                <input
                  type="checkbox"
                  checked={showPeatlands}
                  onChange={(e) => setShowPeatlands(e.target.checked)}
                  className="rounded border-border accent-primary"
                />
                <span className="font-medium text-foreground">Peatland Zones (KHG)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground text-[11px]">
                <input
                  type="checkbox"
                  checked={showRadarPulse}
                  onChange={(e) => setShowRadarPulse(e.target.checked)}
                  className="rounded border-border accent-primary"
                />
                <span className="font-medium text-foreground">Top 5 Pulse Radar</span>
              </label>
            </div>
          </div>

          {/* FRP Intensity Legend */}
          <div className="rounded-lg border border-border/80 bg-background/95 p-2.5 text-xs shadow-lg backdrop-blur-md">
            <p className="mb-1 font-semibold text-foreground text-[11px]">FRP Intensity</p>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 border border-white" />
                <span className="font-medium text-foreground">Critical (&gt; 20 MW)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500 border border-white" />
                <span className="text-muted-foreground">Moderate (10 - 20 MW)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 border border-white" />
                <span className="text-muted-foreground">Low (&lt; 10 MW)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Province Quick Jump Smooth Bar */}
      <div className="absolute bottom-3 left-3 z-[1000] flex flex-wrap gap-1 rounded-lg border border-border/80 bg-background/95 p-1 text-xs shadow-lg backdrop-blur-md">
        <button
          onClick={recenterKalimantan}
          className="rounded px-2 py-0.5 font-semibold text-foreground transition hover:bg-muted text-[11px]"
        >
          All Kalimantan
        </button>
        <button
          onClick={() => zoomToProvince(-2.21, 113.92)}
          className="rounded px-1.5 py-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground font-medium text-[11px]"
        >
          Central Kal
        </button>
        <button
          onClick={() => zoomToProvince(-0.02, 109.34)}
          className="rounded px-1.5 py-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground font-medium text-[11px]"
        >
          West Kal
        </button>
        <button
          onClick={() => zoomToProvince(-3.32, 114.59)}
          className="rounded px-1.5 py-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground font-medium text-[11px]"
        >
          South Kal
        </button>
        <button
          onClick={() => zoomToProvince(-0.50, 117.15)}
          className="rounded px-1.5 py-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground font-medium text-[11px]"
        >
          East Kal
        </button>
        <button
          onClick={() => zoomToProvince(2.84, 117.37)}
          className="rounded px-1.5 py-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground font-medium text-[11px]"
        >
          North Kal
        </button>
      </div>
    </div>
  );
}
