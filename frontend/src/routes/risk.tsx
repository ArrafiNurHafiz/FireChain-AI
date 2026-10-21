import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  LineChart,
  CloudSun,
  Wind,
  Droplets,
  Gauge,
  AlertTriangle,
  Flame,
  Info,
  RefreshCw,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { fetchAllProvincesWeather } from "../lib/weather";
import { calculateFWI } from "../lib/fwi";
import { predictPeatFireEscalation, AIFirePredictionResult } from "../lib/ai-engine";
import { getAllHotspots } from "../lib/firms";
import { WeatherData, FWIResult } from "../lib/types";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Peatland Fire Risk Analysis (FWI) — FireChain AI" },
      { name: "description", content: "Canadian Forest Fire Weather Index (FWI) & real-time weather analytics across Kalimantan provinces." },
    ],
  }),
  component: RiskPage,
});

function RiskPage() {
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // AI Neural Network Simulator State
  const [simFrp, setSimFrp] = useState<number>(28);
  const [simTemp, setSimTemp] = useState<number>(34);
  const [simHumidity, setSimHumidity] = useState<number>(45);
  const [simWind, setSimWind] = useState<number>(18);
  const [simPeatDepth, setSimPeatDepth] = useState<number>(280);
  const [aiPred, setAiPred] = useState<AIFirePredictionResult | null>(null);

  useEffect(() => {
    const res = predictPeatFireEscalation({
      frp: simFrp,
      bright_ti4: 335 + simFrp * 0.4,
      temp: simTemp,
      humidity: simHumidity,
      wind_speed: simWind,
      rain: 0,
      peat_depth_cm: simPeatDepth,
      soil_moisture_est: Math.max(15, simHumidity * 0.6),
    });
    setAiPred(res);
  }, [simFrp, simTemp, simHumidity, simWind, simPeatDepth]);

  const hotspots = getAllHotspots();

  const loadData = async () => {
    setRefreshing(true);
    const data = await fetchAllProvincesWeather();
    setWeatherMap(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const provinces = [
    "Kalimantan Tengah",
    "Kalimantan Barat",
    "Kalimantan Selatan",
    "Kalimantan Timur",
    "Kalimantan Utara",
  ];

  const getProvinceHotspotsCount = (prov: string) => {
    return hotspots.filter((h) => h.province === prov).length;
  };

  const badgeColor: Record<string, string> = {
    "Sangat Tinggi": "bg-red-500/20 text-red-500 border-red-500/30",
    Tinggi: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    Sedang: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    Rendah: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider font-mono">
                Standard Algorithm
              </span>
              <span className="text-xs text-muted-foreground">Canadian Forest Fire Weather Index (FWI)</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Multi-Province Peatland Fire Risk Analysis
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live Open-Meteo weather parameters coupled with FFMC, ISI, and tropical peat fuel load calculations.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Weather Data
          </button>
        </div>

        {/* 5 Province Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {provinces.map((prov) => {
            const w = weatherMap[prov];
            const hsCount = getProvinceHotspotsCount(prov);
            const fwi = w ? calculateFWI(w, hsCount) : null;

            return (
              <div
                key={prov}
                className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 hover:border-primary/40 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{prov}</h3>
                    <p className="text-xs text-muted-foreground">
                      Station: {w?.city || "Fetching live data..."}
                    </p>
                  </div>
                  {fwi && (
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${badgeColor[fwi.level]}`}>
                      {fwi.level}
                    </span>
                  )}
                </div>

                {/* Score & Weather */}
                {w && fwi ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                      <div>
                        <span className="text-3xl font-extrabold font-mono text-foreground">
                          {fwi.risk_score}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">/ 100</span>
                        <p className="text-[11px] text-muted-foreground font-medium">Risk Index Score</p>
                      </div>
                      <div className="text-right text-xs space-y-0.5">
                        <div className="flex items-center justify-end gap-1.5 text-foreground font-mono font-bold">
                          <CloudSun className="h-4 w-4 text-yellow-500" />
                          <span>{w.temp}°C</span>
                        </div>
                        <p className="text-muted-foreground text-[11px]">Humidity: {w.humidity}%</p>
                        <p className="text-muted-foreground text-[11px]">Wind: {w.wind_speed} km/h</p>
                      </div>
                    </div>

                    {/* Scientific FWI Parameters */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-border/60 bg-background/50 p-2">
                        <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                          <span>FFMC (Fuel Moisture)</span>
                          <Info className="h-3 w-3" />
                        </div>
                        <p className="font-mono font-bold text-foreground text-sm mt-0.5">{fwi.ffmc}</p>
                        <p className="text-[10px] text-muted-foreground">Fine Fuel Moisture Code</p>
                      </div>

                      <div className="rounded-lg border border-border/60 bg-background/50 p-2">
                        <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                          <span>ISI (Spread Index)</span>
                          <Info className="h-3 w-3" />
                        </div>
                        <p className="font-mono font-bold text-foreground text-sm mt-0.5">{fwi.isi}</p>
                        <p className="text-[10px] text-muted-foreground">Initial Spread Index</p>
                      </div>
                    </div>

                    {/* Hotspot count in province */}
                    <div className="flex items-center justify-between text-xs border-t border-border/60 pt-2 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5 text-red-500" /> Active Hotspots Detected:
                      </span>
                      <b className="font-mono text-foreground font-bold">{hsCount.toLocaleString()} spots</b>
                    </div>

                    <p className="rounded-lg bg-muted/30 p-2 text-[11px] text-muted-foreground leading-relaxed">
                      {fwi.summary}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-4 text-center">Calculating FWI parameters...</p>
                )}
              </div>
            );
          })}
        </section>

        {/* Interactive AI Neural Network Simulator (PeatNet) */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-primary animate-pulse" />
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  AI Neural Network Simulator (FireChain PeatNet v2.4)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Interactive multi-variate MLP inference: predicts subterranean smoldering probability & perimeter spread rate per hour.
                </p>
              </div>
            </div>
            {aiPred && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">Inference: {aiPred.inference_time_ms}ms</span>
                <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${badgeColor[aiPred.risk_level] || "bg-primary/20 text-primary"}`}>
                  {aiPred.risk_level} ({aiPred.escalation_risk_score}/100)
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1.5 font-medium">
                  <span className="text-foreground">NASA Satellite Radiative Power (FRP):</span>
                  <span className="font-mono font-bold text-primary">{simFrp} MW</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="120"
                  step="1"
                  value={simFrp}
                  onChange={(e) => setSimFrp(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-medium">
                  <span className="text-foreground">Ambient Air Temperature:</span>
                  <span className="font-mono font-bold text-yellow-500">{simTemp} °C</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="42"
                  step="0.5"
                  value={simTemp}
                  onChange={(e) => setSimTemp(Number(e.target.value))}
                  className="w-full accent-yellow-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-medium">
                  <span className="text-foreground">Relative Humidity (RH):</span>
                  <span className="font-mono font-bold text-blue-400">{simHumidity} %</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="95"
                  step="1"
                  value={simHumidity}
                  onChange={(e) => setSimHumidity(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-medium">
                  <span className="text-foreground">10m Wind Speed:</span>
                  <span className="font-mono font-bold text-foreground">{simWind} km/h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  step="1"
                  value={simWind}
                  onChange={(e) => setSimWind(Number(e.target.value))}
                  className="w-full accent-foreground cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-medium">
                  <span className="text-foreground">Peatland Layer Depth (KHG):</span>
                  <span className="font-mono font-bold text-amber-500">{simPeatDepth} cm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={simPeatDepth}
                  onChange={(e) => setSimPeatDepth(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Neural Net Outputs & Tactical Directive */}
            {aiPred && (
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-lg bg-card p-3 border border-border/60">
                    <p className="text-[11px] text-muted-foreground">Smoldering Probability (Subterranean)</p>
                    <p className="text-2xl font-extrabold font-mono text-red-500 mt-0.5">
                      {aiPred.smoldering_probability_pct}%
                    </p>
                    <span className="text-[10px] text-muted-foreground">Sigmoid Activation</span>
                  </div>
                  <div className="rounded-lg bg-card p-3 border border-border/60">
                    <p className="text-[11px] text-muted-foreground">Projected Perimeter Spread Rate</p>
                    <p className="text-2xl font-extrabold font-mono text-orange-500 mt-0.5">
                      {aiPred.spread_rate_m_hr} <span className="text-xs font-normal">m/h</span>
                    </p>
                    <span className="text-[10px] text-muted-foreground">Elliptical Wind Vector</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="font-bold text-foreground text-[11px]">Feature Importances (Shapley Attributions):</p>
                  {aiPred.feature_importances.slice(0, 4).map((f) => (
                    <div key={f.feature} className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{f.feature}</span>
                      <span className="font-mono font-bold text-foreground">+{f.impact_pct}%</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs space-y-1">
                  <span className="font-bold text-primary text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    AI Tactical Directive ({aiPred.suppression_priority})
                  </span>
                  <p className="text-foreground text-[11px] leading-relaxed">
                    {aiPred.tactical_directive}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Scientific Methodology Explainer Box */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            Canadian Forest Fire Weather Index (FWI) Methodology for Peatland Ecosystems
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The FWI algorithm is the international benchmark for fire hazard modeling. 
            In FireChain AI, it is adapted specifically for tropical peatland hydrology:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
              <p className="font-bold text-foreground">1. Fine Fuel Moisture Code (FFMC)</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Measures dryness of top litter and moss layers on peat surfaces. Values &gt; 85 indicate fuels ignite readily from small sparks.
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
              <p className="font-bold text-foreground">2. Initial Spread Index (ISI)</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Combines fuel moisture and 10-meter open wind speed to project the rate of forward fire perimeter propagation.
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
              <p className="font-bold text-foreground">3. Peatland Vulnerability Weighting</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Weights peat depth and canal drainage status. Underground smoldering fires release dense greenhouse gas emissions that persist for weeks.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
