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
import { getAllHotspots } from "../lib/firms";
import { WeatherData, FWIResult } from "../lib/types";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Analisis Risiko Kebakaran FWI — FireChain AI" },
      { name: "description", content: "Kalkulasi Canadian Forest Fire Weather Index (FWI) & cuaca real-time di seluruh provinsi Kalimantan." },
    ],
  }),
  component: RiskPage,
});

function RiskPage() {
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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
              Analisis Risiko Multi-Provinsi Kalimantan
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Parameter cuaca live Open-Meteo dipadukan formula FFMC, ISI, dan beban bahan bakar gambut.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Perbarui Parameter
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
                      Stasiun: {w?.city || "Mengambil data..."}
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
                        <p className="text-[11px] text-muted-foreground font-medium">Skor Indeks Risiko</p>
                      </div>
                      <div className="text-right text-xs space-y-0.5">
                        <div className="flex items-center justify-end gap-1.5 text-foreground font-mono font-bold">
                          <CloudSun className="h-4 w-4 text-yellow-500" />
                          <span>{w.temp}°C</span>
                        </div>
                        <p className="text-muted-foreground text-[11px]">Kelembapan: {w.humidity}%</p>
                        <p className="text-muted-foreground text-[11px]">Angin: {w.wind_speed} km/j</p>
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
                        <Flame className="h-3.5 w-3.5 text-red-500" /> Hotspot Aktif Terdeteksi:
                      </span>
                      <b className="font-mono text-foreground font-bold">{hsCount.toLocaleString()} titik</b>
                    </div>

                    <p className="rounded-lg bg-muted/30 p-2 text-[11px] text-muted-foreground leading-relaxed">
                      {fwi.summary}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-4 text-center">Memuat kalkulasi FWI...</p>
                )}
              </div>
            );
          })}
        </section>

        {/* Scientific Methodology Explainer Box */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            Metodologi Canadian Forest Fire Weather Index (FWI) untuk Ekosistem Gambut
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Algoritma FWI merupakan standar global pemodelan risiko bahaya kebakaran hutan dan lahan. 
            Dalam FireChain AI, model ini disesuaikan khusus dengan karakteristik lahan gambut tropis (tropical peatland):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
              <p className="font-bold text-foreground">1. Fine Fuel Moisture Code (FFMC)</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Mengukur tingkat kekeringan serasah dan lapisan lumut permukaan gambut. Nilai &gt; 85 mengindikasikan bahan bakar sangat mudah tersulut percikan api kecil.
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
              <p className="font-bold text-foreground">2. Initial Spread Index (ISI)</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Menggabungkan kadar lengas bahan bakar dan kecepatan angin 10 meter untuk memproyeksikan laju percepatan rambatan api di permukaan kanopi.
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
              <p className="font-bold text-foreground">3. Peatland Vulnerability Weighting</p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Menimbang keberadaan kesatuan hidrologis gambut (KHG). Kebakaran gambut memiliki risiko api bawah tanah (smoldering) yang memancarkan gas rumah kaca berkali-kali lipat.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
