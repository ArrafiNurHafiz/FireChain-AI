import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Flame,
  Search,
  Filter,
  Layers,
  MapPin,
  Compass,
  Info,
  ExternalLink,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { LiveMap } from "../components/LiveMap";
import { getAllHotspots, filterHotspots, getHotspotStats } from "../lib/firms";
import { predictPeatFireEscalation } from "../lib/ai-engine";
import { Hotspot } from "../lib/types";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Hotspot Map Kalimantan — FireChain AI" },
      { name: "description", content: "Interactive map of NASA FIRMS satellite thermal anomalies and Kalimantan peatland hydrological units." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const allHotspots = getAllHotspots();

  const [province, setProvince] = useState<string>("Semua");
  const [confidence, setConfidence] = useState<"all" | "high" | "nominal" | "low">("all");
  const [minFrp, setMinFrp] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  const filtered = filterHotspots(allHotspots, {
    province,
    confidence,
    minFrp,
    searchQuery: search,
  });

  const stats = getHotspotStats(filtered);

  return (
    <AppLayout>
      <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        {/* Filter Bar */}
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search hotspot ID or province..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Semua">All Provinces</option>
              <option value="Kalimantan Tengah">Central Kalimantan</option>
              <option value="Kalimantan Barat">West Kalimantan</option>
              <option value="Kalimantan Selatan">South Kalimantan</option>
              <option value="Kalimantan Timur">East Kalimantan</option>
              <option value="Kalimantan Utara">North Kalimantan</option>
            </select>

            <select
              value={confidence}
              onChange={(e) => setConfidence(e.target.value as any)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Confidence</option>
              <option value="high">High Confidence Only</option>
              <option value="nominal">Nominal & High</option>
            </select>

            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs">
              <span className="text-muted-foreground">Min FRP:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={minFrp}
                onChange={(e) => setMinFrp(Number(e.target.value))}
                className="w-12 bg-transparent text-right font-mono font-semibold text-foreground focus:outline-none"
              />
              <span className="text-muted-foreground">MW</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 font-mono">
            <span>
              Displaying: <b className="text-foreground">{filtered.length.toLocaleString()}</b> / {allHotspots.length.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Map + Inspector Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
          <div className="lg:col-span-3 h-full rounded-xl overflow-hidden border border-border">
            <LiveMap
              hotspots={filtered}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={(h) => setSelectedHotspot(h)}
              className="h-full w-full"
            />
          </div>

          {/* Inspector Panel */}
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between overflow-y-auto shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-primary" />
                  Hotspot Inspector
                </h3>
                {selectedHotspot && (
                  <button
                    onClick={() => setSelectedHotspot(null)}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Reset
                  </button>
                )}
              </div>

              {selectedHotspot ? (
                <div className="space-y-3 text-xs">
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                    <span className="font-mono font-bold text-primary text-sm">{selectedHotspot.id}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{selectedHotspot.province}</p>
                  </div>

                  <div className="space-y-2 border-t border-border/40 pt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coordinates:</span>
                      <span className="font-mono font-bold text-foreground">
                        {selectedHotspot.latitude.toFixed(4)}, {selectedHotspot.longitude.toFixed(4)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fire Radiative Power:</span>
                      <span className="font-mono font-bold text-red-500">{selectedHotspot.frp} MW</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brightness Temp (TI4):</span>
                      <span className="font-mono font-bold text-foreground">
                        {selectedHotspot.bright_ti4} K ({(selectedHotspot.bright_ti4 - 273.15).toFixed(1)} °C)
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confidence Level:</span>
                      <span className="font-semibold uppercase text-primary font-mono">
                        {selectedHotspot.confidence}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Acquisition Time:</span>
                      <span className="font-mono text-foreground">
                        {selectedHotspot.acq_date} {selectedHotspot.acq_time} UTC
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sensor Instrument:</span>
                      <span className="text-foreground">Suomi-NPP VIIRS (NASA)</span>
                    </div>
                  </div>

                  {/* Real AI Neural Network Prediction for Selected Hotspot */}
                  {(() => {
                    const aiEval = predictPeatFireEscalation({
                      frp: selectedHotspot.frp,
                      bright_ti4: selectedHotspot.bright_ti4,
                      temp: 32.5,
                      humidity: 50,
                      wind_speed: 14,
                      rain: 0,
                      peat_depth_cm: 250,
                      soil_moisture_est: 28,
                    });
                    return (
                      <div className="rounded-lg border border-primary/30 bg-primary/10 p-2.5 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-[11px] flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            AI PeatNet Assessment
                          </span>
                          <span className="font-mono font-bold text-primary text-[11px]">
                            {aiEval.risk_level} ({aiEval.escalation_risk_score}/100)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <span className="text-muted-foreground">Smoldering Prob:</span>
                            <p className="font-mono font-bold text-red-400">{aiEval.smoldering_probability_pct}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Spread Velocity:</span>
                            <p className="font-mono font-bold text-orange-400">{aiEval.spread_rate_m_hr} m/h</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight pt-0.5">
                          {aiEval.tactical_directive}
                        </p>
                      </div>
                    );
                  })()}

                  <div className="pt-2">
                    <a
                      href={`/reports`}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
                    >
                      <Flame className="h-3.5 w-3.5" />
                      File Incident Report
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground space-y-2">
                  <Info className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="font-medium">Select a hotspot on the map</p>
                  <p className="text-[11px] leading-relaxed">
                    Click any red/orange marker on the map to inspect satellite telemetry, FRP, and exact coordinates.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stats Summary */}
            <div className="border-t border-border/60 pt-3 text-xs space-y-2">
              <p className="font-semibold text-foreground text-[11px]">Filtered Hotspots Summary</p>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Average FRP:</span>
                <span className="font-mono font-bold text-foreground">{stats.avgFrp} MW</span>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>High Confidence Hotspots:</span>
                <span className="font-mono font-bold text-red-500">{stats.highConfidence}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
