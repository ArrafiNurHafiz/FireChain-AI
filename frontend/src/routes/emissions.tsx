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
      { title: "Carbon Accounting (IPCC Tier 2) — FireChain AI" },
      { name: "description", content: "Greenhouse gas emissions estimation and avoided emissions accounting from Kalimantan peatland fire mitigation." },
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
              Carbon Emissions Accounting & Peatland Mitigation
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mathematically computed from VIIRS satellite Fire Radiative Energy (FRE) and Indonesian tropical peat emission factors.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center shrink-0">
            <span className="text-[11px] text-muted-foreground font-semibold">Total Avoided Emissions</span>
            <p className="text-2xl font-extrabold font-mono text-emerald-400">
              {emissions.avoided_emissions_tco2e.toLocaleString()} <span className="text-xs">tCO₂e</span>
            </p>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">Accumulated Radiative Power</span>
            <p className="text-2xl font-bold font-mono text-foreground mt-2">
              {emissions.total_frp_mw.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">MW</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">VIIRS 375m NRT Sensor</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">Peat Biomass Consumed</span>
            <p className="text-2xl font-bold font-mono text-foreground mt-2">
              {emissions.biomass_consumed_ton.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Tons DM</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Wooster (2005) FRE Method</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">Estimated Gross Emissions</span>
            <p className="text-2xl font-bold font-mono text-red-500 mt-2">
              {emissions.gross_emissions_tco2e.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">tCO₂e</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Without rapid suppression</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">Peatland Area Impacted</span>
            <p className="text-2xl font-bold font-mono text-orange-500 mt-2">
              {emissions.estimated_burned_area_ha.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">ha</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Satellite thermal perimeter</p>
          </div>
        </section>

        {/* Detailed Gas Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-500" />
              Peatland-Specific Greenhouse Gas Breakdown (IPCC Tier 2)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Peat fires release dense gas cocktails with high Global Warming Potential (GWP) due to incomplete subterranean smoldering combustion:
            </p>

            <div className="space-y-3 pt-2">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Carbon Dioxide (CO₂)</span>
                  <span className="font-mono font-bold text-foreground">{emissions.co2_tco2e.toLocaleString()} tCO₂e</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "70%" }} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Emission Factor: <b>1,703 g CO₂ / kg dry peat</b> (IPCC Tier 2 default for tropical peatland).
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Methane (CH₄) — GWP 28</span>
                  <span className="font-mono font-bold text-orange-500">{emissions.ch4_tco2e.toLocaleString()} tCO₂e</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: "24%" }} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Emission Factor: <b>21.0 g CH₄ / kg</b>. Tropical peat fires emit 5-10x more methane than upland savanna fires.
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Carbon Monoxide (CO) & Nitrous Oxide (N₂O)</span>
                  <span className="font-mono font-bold text-foreground">{(emissions.co_tco2e + emissions.n2o_tco2e).toLocaleString()} tCO₂e</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "6%" }} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Emission Factor CO: 210 g/kg, N₂O: 0.15 g/kg (GWP 265).
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Avoided Emissions Calculator */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Verified Fast-Action Simulation
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Early intervention (aerial water-bombing & wet canal trenching) before flames penetrate deep subterranean peat domes prevents an average escalation of <b>785 tCO₂e per cluster</b>.
            </p>

            <div className="space-y-3 rounded-lg bg-muted/30 p-3.5 border border-border/50 text-xs">
              <label className="block font-semibold text-foreground">
                Rapidly Extinguished Hotspot Clusters:
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
                Equivalent to preserving approximately <b>{(interventionsCount * 6.5).toFixed(1)} hectares</b> of virgin deep peat canopy.
              </p>
            </div>

            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-400 space-y-1">
              <p className="font-semibold text-foreground">Potential Verified Carbon Credits:</p>
              <p className="text-xl font-bold font-mono">
                {emissions.avoided_emissions_tco2e.toLocaleString()} VCUs
              </p>
              <p className="text-[11px] text-muted-foreground">
                Eligible for registration in international carbon credit standards and national climate registries via FireChain smart contracts.
              </p>
            </div>
          </div>
        </section>

        {/* Scientific Reference Box */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2 text-xs">
          <p className="font-bold text-foreground">Scientific Reference & Mathematical Formulations:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
            <li>
              <b>Wooster et al. (2005) FRE Approach:</b> Biomass consumed is directly proportional to cumulative Fire Radiative Energy: M(biomass) = C_rad x FRP x time, with conversion coefficient C_rad = 0.368 kg/MJ.
            </li>
            <li>
              <b>IPCC (2013) Wetlands Supplement:</b> Authoritative international methodology for national greenhouse gas inventories on drained and burned tropical inland organic soils.
            </li>
            <li>
              <b>Decentralized MRV (Measurement, Reporting, Verification):</b> Ensures transparency, tamper-proof carbon accounting, and double-counting prevention on EVM blockchain.
            </li>
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
