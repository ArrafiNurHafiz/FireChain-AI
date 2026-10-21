import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Hotspot, PeatlandZone } from "../lib/types";
import rawPeatlands from "../data/peatlands.json";

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

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper to render Hotspots
  const renderHotspots = (
    L: any,
    group: any,
    spots: Hotspot[],
    visible: boolean,
    onSelect?: (h: Hotspot) => void
  ) => {
    group.clearLayers();
    if (!visible) return;

    // Render up to 800 hotspots for optimal responsiveness
    const displaySpots = spots.slice(0, 800);

    displaySpots.forEach((h) => {
      let color = "#eab308"; // low / yellow
      let radius = 5;
      if (h.frp >= 20 || h.confidence === "high") {
        color = "#ef4444"; // red
        radius = 8;
      } else if (h.frp >= 10 || h.confidence === "nominal") {
        color = "#f97316"; // orange
        radius = 6;
      }

      const marker = L.circleMarker([h.latitude, h.longitude], {
        radius,
        fillColor: color,
        color: "#ffffff",
        weight: 1.5,
        opacity: 0.95,
        fillOpacity: 0.85,
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 6px; line-height: 1.4;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
            <b style="color: ${color}; font-size: 13px;">${h.id}</b>
            <span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">${h.confidence.toUpperCase()}</span>
          </div>
          <div><b>Provinsi:</b> ${h.province}</div>
          <div><b>Koordinat:</b> ${h.latitude.toFixed(4)}, ${h.longitude.toFixed(4)}</div>
          <div><b>FRP:</b> <span style="font-weight: 700; color: ${color};">${h.frp} MW</span></div>
          <div><b>Suhu Termal:</b> ${h.bright_ti4} K (${(h.bright_ti4 - 273.15).toFixed(1)} °C)</div>
          <div><b>Waktu Deteksi:</b> ${h.acq_date} ${h.acq_time} UTC</div>
          <div><b>Instrumen:</b> Suomi-NPP VIIRS (NASA FIRMS)</div>
          <div style="margin-top: 8px;">
            <a href="/reports" style="display: inline-block; background: #ef4444; color: #fff; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: 600;">
              Buat Laporan / Verifikasi
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
        dashArray: "5, 5",
      });

      polygon.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #1e293b; padding: 4px;">
          <b style="color: #b45309; font-size: 13px;">${p.name}</b><br/>
          <span><b>Provinsi:</b> ${p.province}</span><br/>
          <span><b>Kedalaman Gambut:</b> ${p.depth_class}</span><br/>
          <span><b>Luas:</b> ${(p.area_ha || 0).toLocaleString()} ha</span><br/>
          <span><b>Stok Karbon:</b> ${p.carbon_density_ton_ha} ton C/ha</span>
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

      // ESRI World Imagery (High-res real satellite, no API key required)
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
      renderHotspots(L, markersGroup, hotspots, showHotspots, onSelectHotspot);

      setLeafletLoaded(true);

      // Trigger size invalidation after layout settles
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
        const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        });
        osm.addTo(mapInstanceRef.current);
        tileLayerRef.current = osm;
      }
    });
  };

  // Update Hotspot Markers when hotspots change or visibility toggled
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !leafletLoaded) return;

    import("leaflet").then((L) => {
      renderHotspots(
        L,
        markersLayerRef.current,
        hotspots,
        showHotspots,
        onSelectHotspot
      );
    });
  }, [hotspots, showHotspots, leafletLoaded, onSelectHotspot]);

  // Center on selected hotspot if provided
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedHotspot) return;
    mapInstanceRef.current.setView([selectedHotspot.latitude, selectedHotspot.longitude], 10, {
      animate: true,
    });
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
      mapInstanceRef.current.setView([-1.5, 114.0], 6);
    }
  };

  const zoomToProvince = (lat: number, lon: number, zoom: number = 7) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], zoom);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border bg-card shadow-lg ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Layer and Zoom Controls */}
      {showLayersControl && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          {/* Base Layer Switcher */}
          <div className="rounded-lg border border-border/80 bg-background/95 p-2 text-xs shadow-md backdrop-blur">
            <p className="mb-1.5 font-semibold text-foreground">Tampilan Peta</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => switchBaseLayer("satellite")}
                className={`rounded px-2 py-1 font-medium transition ${
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
                className={`rounded px-2 py-1 font-medium transition ${
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
          <div className="rounded-lg border border-border/80 bg-background/95 p-3 text-xs shadow-md backdrop-blur">
            <p className="mb-2 font-semibold text-foreground">Layer Tematik</p>
            <div className="space-y-1.5">
              <label className="flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={showHotspots}
                  onChange={(e) => setShowHotspots(e.target.checked)}
                  className="rounded border-border accent-primary"
                />
                <span className="font-medium text-foreground">NASA FIRMS ({hotspots.length} titik)</span>
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

          {/* FRP Legend */}
          <div className="rounded-lg border border-border/80 bg-background/95 p-3 text-xs shadow-md backdrop-blur">
            <p className="mb-2 font-semibold text-foreground">Intensitas Radiasi (FRP)</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500 border border-white shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
                <span>Tinggi (&gt; 20 MW)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500 border border-white" />
                <span>Sedang (10 - 20 MW)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-yellow-400 border border-white" />
                <span>Rendah (&lt; 10 MW)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Province Quick Jump Bar */}
      <div className="absolute bottom-3 left-3 z-[1000] flex flex-wrap gap-1.5 rounded-lg border border-border/80 bg-background/95 p-1.5 text-xs shadow-md backdrop-blur">
        <button
          onClick={recenterKalimantan}
          className="rounded px-2.5 py-1 font-semibold text-foreground transition hover:bg-muted"
        >
          Semua Kalimantan
        </button>
        <button
          onClick={() => zoomToProvince(-2.21, 113.92)}
          className="rounded px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          KalTeng
        </button>
        <button
          onClick={() => zoomToProvince(-0.02, 109.34)}
          className="rounded px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          KalBar
        </button>
        <button
          onClick={() => zoomToProvince(-3.32, 114.59)}
          className="rounded px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          KalSel
        </button>
        <button
          onClick={() => zoomToProvince(-0.50, 117.15)}
          className="rounded px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          KalTim
        </button>
        <button
          onClick={() => zoomToProvince(2.84, 117.37)}
          className="rounded px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          KalTara
        </button>
      </div>
    </div>
  );
}
