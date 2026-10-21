import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Leaf,
  Flame,
  ShieldCheck,
  TrendingDown,
  Info,
  Layers,
  ArrowRight,
  Database,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { getAllHotspots } from "../lib/firms";
import { calculateEmissions } from "../lib/emissions";

export const Route = createFileRoute("/emissions")({
  head: () => ({
    meta: [
      { title: "Akuntansi Emisi Karbon (IPCC Tier 2) — FireChain AI" },
      { name: "description", content: "Metodologi estimasi emisi gas rumah kaca dan emisi yang dihindari (avoided emissions) dari kebakaran gambut." },
    ],
  }),
  component: EmissionsPage,
});

function EmissionsPage() {
  const hotspots = getAllHotspots();
  const [interventionsCount, setInterventionsCount] = useState<number>(18);

  const emissions = calculateEmissions(hotspots, interventionsCount);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider font-mono">
                IPCC 2013 Wetlands Supplement
              </span>
              <span className="text-xs text-muted-foreground">Chapter 2: Drained Inland Organic Soils</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Akuntansi Emisi Karbon & Mitigasi Lahan Gambut
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dihitung matematis dari akumulasi Fire Radiative Energy (FRE) satelit VIIRS dan faktor emisi spesifik gambut tropis Indonesia.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center shrink-0">
            <span className="text-[11px] text-muted-foreground font-semibold">Total Emisi Dihindari</span>
            <p className="text-2xl font-extrabold font-mono text-emerald-400">
              {emissions.avoided_emissions_tco2e.toLocaleString()} <span className="text-xs">tCO₂e</span>
            </p>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">Akumulasi Fire Radiative Power</span>
            <p className="text-2xl font-bold font-mono text-foreground mt-2">
              {emissions.total_frp_mw.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">MW</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Sensor VIIRS 375m NRT</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">Biomassa Gambut Terbakar</span>
            <p className="text-2xl font-bold font-mono text-foreground mt-2">
              {emissions.biomass_consumed_ton.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Ton DM</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Metode FRE Wooster (2005)</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">Estimasi Emisi Kotor (Gross)</span>
            <p className="text-2xl font-bold font-mono text-red-500 mt-2">
              {emissions.gross_emissions_tco2e.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">tCO₂e</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Jika tidak dipadamkan</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">Luas Area Gambut Terdampak</span>
            <p className="text-2xl font-bold font-mono text-orange-500 mt-2">
              {emissions.estimated_burned_area_ha.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">ha</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Tapak kluster termal satelit</p>
          </div>
        </section>

        {/* Detailed Gas Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-500" />
              Rincian Gas Rumah Kaca Spesifik Lahan Gambut (IPCC Tier 2)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kebakaran lahan gambut melepaskan campuran gas dengan potensi pemanasan global (GWP) tinggi karena pembakaran tidak sempurna (smoldering combustion) di bawah tanah:
            </p>

            <div className="space-y-3 pt-2">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Karbondioksida (CO₂)</span>
                  <span className="font-mono font-bold text-foreground">{emissions.co2_tco2e.toLocaleString()} tCO₂e</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "70%" }} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Faktor Emisi: <b>1,703 g CO₂ / kg bahan bakar kering</b> (IPCC Tier 2 default untuk tropical peatland).
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Metana (CH₄) — GWP 28</span>
                  <span className="font-mono font-bold text-orange-500">{emissions.ch4_tco2e.toLocaleString()} tCO₂e</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: "24%" }} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Faktor Emisi: <b>21.0 g CH₄ / kg</b>. Peat fires memancarkan metana 5-10x lebih tinggi dibanding kebakaran savana/hutan mineral.
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Karbon Monoksida (CO) & Dinitrogen Oksida (N₂O)</span>
                  <span className="font-mono font-bold text-foreground">{(emissions.co_tco2e + emissions.n2o_tco2e).toLocaleString()} tCO₂e</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "6%" }} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Faktor Emisi CO: 210 g/kg, N₂O: 0.15 g/kg (GWP 265).
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Avoided Emissions Calculator */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Simulasi Aksi Cepat Terverifikasi
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Intervensi awal (water-bombing & pembuatan parit sekat bakar) sebelum api menembus kubah gambut dalam menghindari eskalasi emisi rata-rata <b>785 tCO₂e per lokasi</b>.
            </p>

            <div className="space-y-3 rounded-lg bg-muted/30 p-3.5 border border-border/50 text-xs">
              <label className="block font-semibold text-foreground">
                Jumlah Titik Berhasil Dipadamkan Cepat:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={interventionsCount}
                  onChange={(e) => setInterventionsCount(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <span className="font-mono font-bold text-foreground text-sm w-8 text-right">
                  {interventionsCount}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Setara dengan penyelamatan sekitar <b>{(interventionsCount * 6.5).toFixed(1)} hektar</b> tutupan gambut perawan.
              </p>
            </div>

            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-400 space-y-1">
              <p className="font-semibold text-foreground">Potensi Kredit Karbon Terverifikasi:</p>
              <p className="text-xl font-bold font-mono">
                {emissions.avoided_emissions_tco2e.toLocaleString()} VCUs
              </p>
              <p className="text-[11px] text-muted-foreground">
                Dapat didaftarkan ke SRN PPI (Sistem Registri Nasional Pengendalian Perubahan Iklim) KLHK via integrasi smart contract FireChain.
              </p>
            </div>
          </div>
        </section>

        {/* Scientific Reference Box */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2 text-xs">
          <p className="font-bold text-foreground">Dasar Ilmiah & Formula Matematis:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
            <li>
              <b>Wooster et al. (2005) FRE Approach:</b> Biomassa terbakar dihitung proporsional terhadap daya radiasi termal M(biomassa) = C_rad x FRP x waktu, dengan konstanta koefisien pembakaran C_rad = 0.368 kg/MJ.
            </li>
            <li>
              <b>IPCC (2013) Wetlands Supplement:</b> Dokumen metodologi internasional resmi untuk inventarisasi gas rumah kaca pada lahan gambut terestrial tropis yang terdrainase dan terbakar.
            </li>
            <li>
              <b>Perpres No. 98 Tahun 2021:</b> Penyelenggaraan Nilai Ekonomi Karbon (NEK) dan pencatatan transparansi aksi mitigasi perubahan iklim di Indonesia.
            </li>
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
