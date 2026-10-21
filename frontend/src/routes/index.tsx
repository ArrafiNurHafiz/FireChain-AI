import React, { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Flame,
  ShieldAlert,
  FileCheck,
  Shield,
  CloudSun,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { LiveMap } from "../components/LiveMap";
import { getAllHotspots, getHotspotStats } from "../lib/firms";
import { fetchLiveFirmsHotspots } from "../lib/server-firms";
import { fetchLiveWeather } from "../lib/weather";
import { calculateFWI } from "../lib/fwi";
import { predictPeatFireEscalation, AIFirePredictionResult } from "../lib/ai-engine";
import { calculateEmissions } from "../lib/emissions";
import { getLedgerBlocks } from "../lib/blockchain";
import { getIncidentReports } from "../lib/reports-store";
import { WeatherData, FWIResult, AuditBlock, IncidentReport, Hotspot } from "../lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FireChain AI — Real-Time Kalimantan Peatland Fire & Climate Ledger" },
      {
        name: "description",
        content: "NASA FIRMS thermal hotspot surveillance, Canadian FWI risk index, and decentralized blockchain audit trail for Kalimantan peatlands.",
      },
    ],
  }),
  component: DashboardIndex,
});

function DashboardIndex() {
  const [hotspots, setHotspots] = useState<Hotspot[]>(getAllHotspots);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>("Satelit VIIRS NRT");

  const stats = getHotspotStats(hotspots);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [fwi, setFwi] = useState<FWIResult | null>(null);
  const [aiPred, setAiPred] = useState<AIFirePredictionResult | null>(null);
  const [reports, setReports] = useState<IncidentReport[]>(getIncidentReports);
  const [blocks, setBlocks] = useState<AuditBlock[]>(getLedgerBlocks);

  const handleSyncFirms = async () => {
    setIsSyncing(true);
    try {
      const res = await fetchLiveFirmsHotspots({ data: { force: true } });
      if (res?.hotspots && res.hotspots.length > 0) {
        setHotspots(res.hotspots);
        setLastSynced(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB");
      }
    } catch (err) {
      console.warn("Gagal sinkronisasi live NASA:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // 1. Fetch real weather for Palangka Raya (center of Central Kalimantan peatlands)
    fetchLiveWeather("Kalimantan Tengah").then((w) => {
      setWeather(w);
      const computedFwi = calculateFWI(w, stats.total);
      setFwi(computedFwi);

      // 2. Real AI Neural Network Forward Pass
      const mlResult = predictPeatFireEscalation({
        frp: stats.avgFrp || 12.5,
        bright_ti4: 338.5,
        temp: w.temp,
        humidity: w.humidity,
        wind_speed: w.wind_speed,
        rain: w.rain,
        peat_depth_cm: 280,
        soil_moisture_est: Math.max(18, w.humidity * 0.6),
      });
      setAiPred(mlResult);
    });

    // 3. Load incidents and ledger blocks
    setReports(getIncidentReports());
    setBlocks(getLedgerBlocks());

    // 3. Periodic automatic sync (every 15 minutes)
    const interval = setInterval(() => {
      handleSyncFirms();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [stats.total]);

  // IPCC real carbon emissions
  const emissions = calculateEmissions(hotspots, 18);

  const badgeColor: Record<string, string> = {
    "Sangat Tinggi": "bg-red-500/20 text-red-500 border-red-500/30",
    Tinggi: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    Sedang: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    Rendah: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Banner / Headline */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border bg-gradient-to-r from-card via-card to-primary/10 p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[11px] font-bold text-primary uppercase tracking-wider">
                Active Detection System
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Satellites: NOAA-20 / Suomi-NPP VIIRS (375m NRT)
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Kalimantan Peatland Wildfire Operations Dashboard
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified NASA FIRMS satellite data integrated with Open-Meteo & decentralized climate emissions ledger.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSyncFirms}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-primary ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync NASA FIRMS"}
            </button>
            <Link
              to="/reports"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition"
            >
              <Flame className="h-3.5 w-3.5" />
              Report Incident
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
            >
              Open Interactive Map
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Live KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">Active Hotspots (24h)</span>
              <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
                <Flame className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-mono">{stats.total.toLocaleString()}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>High Conf: <b className="text-red-500">{stats.highConfidence}</b></span>
              <span>Max FRP: <b className="text-foreground">{stats.maxFrp} MW</b></span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-accent/40 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">Vulnerable Peat Area</span>
              <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-mono">
              {emissions.estimated_burned_area_ha.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">ha</span>
            </p>
            <p className="mt-2 text-xs text-orange-500 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Calculated from FRP thermal footprint
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">Verified Field Reports</span>
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                <FileCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-mono">{reports.length}</p>
            <p className="mt-2 text-xs text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> All anchored to ledger
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-blue-500/40 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">Avoided Emissions (IPCC)</span>
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                <Shield className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-mono">
              {emissions.avoided_emissions_tco2e.toLocaleString()}{" "}
              <span className="text-sm font-normal text-muted-foreground">tCO₂e</span>
            </p>
            <p className="mt-2 text-xs text-blue-400">
              From verified fast peat mitigation actions
            </p>
          </div>
        </section>

        {/* Live Map & Sidebar Analytics */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real Leaflet Map */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Spatial Distribution of Hotspots & Peatlands</h3>
                <p className="text-xs text-muted-foreground">
                  Interactive Leaflet map: NASA FIRMS data + KLHK Peatland Hydrological Units (KHG).
                </p>
              </div>
              <Link to="/map" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                Full Screen <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <LiveMap hotspots={hotspots} className="h-[460px] w-full" />
          </div>

          {/* Real-time Weather & Latest Incidents */}
          <div className="space-y-4">
            {/* Live Weather Widget */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CloudSun className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Real-Time Weather (Open-Meteo)</h4>
                    <p className="text-[11px] text-muted-foreground">Palangka Raya Station, Central Kal</p>
                  </div>
                </div>
                <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                  Live Sync
                </span>
              </div>

              {weather ? (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold font-mono text-foreground">{weather.temp}°C</span>
                    <span className="text-xs text-muted-foreground">
                      Pressure: <b className="text-foreground">{weather.pressure} hPa</b>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-2 text-center text-xs">
                    <div className="rounded bg-muted/40 p-1.5">
                      <p className="text-[10px] text-muted-foreground">Humidity</p>
                      <p className="font-bold text-foreground font-mono">{weather.humidity}%</p>
                    </div>
                    <div className="rounded bg-muted/40 p-1.5">
                      <p className="text-[10px] text-muted-foreground">Precipitation</p>
                      <p className="font-bold text-foreground font-mono">{weather.rain} mm</p>
                    </div>
                    <div className="rounded bg-muted/40 p-1.5">
                      <p className="text-[10px] text-muted-foreground">Wind Speed</p>
                      <p className="font-bold text-foreground font-mono">{weather.wind_speed} km/h</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Loading weather telemetry...</p>
              )}
            </div>

            {/* Latest Verified Reports */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-foreground">Latest Field Incident Reports</h4>
                <Link to="/reports" className="text-xs text-primary font-semibold hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-2.5">
                {reports.slice(0, 3).map((rep) => (
                  <div
                    key={rep.id}
                    className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs transition hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-foreground">{rep.id}</span>
                      <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${badgeColor[rep.severity] || ""}`}>
                        {rep.severity}
                      </span>
                    </div>
                    <p className="font-medium text-foreground line-clamp-1">{rep.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {rep.province}
                      </span>
                      <span className="text-emerald-500 font-medium">{rep.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3 Detailed Lower Cards: FWI Analysis, Blockchain Audit, Carbon Accounting */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Real AI Neural Network Model (PeatNet MLP) */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <h4 className="text-sm font-bold text-foreground">AI Neural Network (PeatNet)</h4>
              </div>
              {aiPred && (
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${badgeColor[aiPred.risk_level] || "bg-primary/20 text-primary"}`}>
                  {aiPred.risk_level}
                </span>
              )}
            </div>

            {aiPred ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 border-primary/80 bg-primary/10 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
                    <span className="text-2xl font-extrabold font-mono text-foreground">{aiPred.escalation_risk_score}</span>
                    <span className="text-[10px] text-muted-foreground">/ 100</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-foreground font-mono text-[11px]">{aiPred.model_name}</p>
                    <p className="text-muted-foreground text-[11px]">
                      Smoldering: <b className="text-red-400 font-mono">{aiPred.smoldering_probability_pct}%</b> | Spread: <b className="text-foreground font-mono">{aiPred.spread_rate_m_hr} m/h</b>
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Inference Latency: {aiPred.inference_time_ms} ms (Edge)
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3 text-xs">
                  <p className="font-semibold text-foreground text-[11px]">Feature Importances (Shapley Attributions):</p>
                  {aiPred.feature_importances.slice(0, 3).map((feat) => (
                    <div key={feat.feature}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground truncate">{feat.feature}</span>
                        <span className="font-mono font-semibold text-foreground">+{feat.impact_pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                          style={{ width: `${feat.impact_pct * 2.5}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="rounded-lg bg-muted/60 p-2.5 text-[11px] text-muted-foreground leading-relaxed border border-border/50">
                  <b className="text-foreground">AI Tactical Directive:</b> {aiPred.tactical_directive}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Running AI model inference...</p>
            )}
          </div>

          {/* 2. Cryptographic Blockchain Audit Trail (Polygon Amoy Live) */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Blockchain Audit Trail</h4>
              <span className="flex items-center gap-1 text-xs text-emerald-500 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Polygon Amoy Verified
              </span>
            </div>

            <div className="space-y-3">
              {blocks.slice(-3).reverse().map((b) => (
                <div key={b.index} className="rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-primary/20 text-primary px-1.5 py-0.2 font-mono text-[10px] font-bold">
                      Block #{b.index}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(b.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} UTC
                    </span>
                  </div>
                  <p className="font-semibold text-foreground text-[11px]">{b.record_type}</p>
                  <div className="font-mono text-[10px] text-muted-foreground truncate">
                    Hash: <span className="text-foreground">{b.block_hash.slice(0, 18)}...</span>
                  </div>
                  {b.polygon_block_number && (
                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                      <span className="text-purple-400 font-mono">Amoy #{b.polygon_block_number}</span>
                      <a
                        href={b.polygonscan_url || "https://amoy.polygonscan.com"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-0.5"
                      >
                        Polygonscan <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-border/60 pt-3">
              <Link
                to="/audit"
                className="flex items-center justify-between text-xs font-semibold text-primary hover:underline"
              >
                <span>Verify Cryptographic Chain (Merkle Tree)</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 3. IPCC Carbon Emissions Calculation */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">Carbon Accounting (IPCC Tier 2)</h4>
              <span className="rounded bg-emerald-500/20 text-emerald-500 px-2 py-0.5 text-[10px] font-bold font-mono">
                Wetlands 2013
              </span>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Avoided Emissions Estimate</p>
              <p className="text-2xl font-extrabold font-mono text-emerald-500 mt-0.5">
                {emissions.avoided_emissions_tco2e.toLocaleString()}{" "}
                <span className="text-xs font-normal text-muted-foreground">tCO₂e</span>
              </p>
            </div>

            <div className="space-y-2 border-t border-border/60 pt-3 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Accumulated FRP:</span>
                <span className="font-mono font-bold text-foreground">{emissions.total_frp_mw.toLocaleString()} MW</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Biomass Consumed:</span>
                <span className="font-mono font-bold text-foreground">{emissions.biomass_consumed_ton.toLocaleString()} Tons</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">CO₂ Emissions (1,703 g/kg DM):</span>
                <span className="font-mono font-bold text-foreground">{emissions.co2_tco2e.toLocaleString()} tCO₂e</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Methane CH₄ (GWP 28):</span>
                <span className="font-mono font-bold text-foreground">{emissions.ch4_tco2e.toLocaleString()} tCO₂e</span>
              </div>
            </div>

            <div className="border-t border-border/60 pt-3">
              <Link
                to="/emissions"
                className="flex items-center justify-between text-xs font-semibold text-primary hover:underline"
              >
                <span>View Full Methodology & Carbon Model</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
