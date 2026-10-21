import { Hotspot } from "./types";
import rawHotspots from "../data/kalimantan_hotspots.json";

export interface HotspotFilters {
  province?: string;
  confidence?: "all" | "high" | "nominal" | "low";
  minFrp?: number;
  daynight?: "all" | "D" | "N";
  searchQuery?: string;
}

export function getAllHotspots(): Hotspot[] {
  return rawHotspots as Hotspot[];
}

export function filterHotspots(hotspots: Hotspot[], filters: HotspotFilters): Hotspot[] {
  return hotspots.filter((h) => {
    if (filters.province && filters.province !== "Semua" && h.province !== filters.province) {
      return false;
    }
    if (filters.confidence && filters.confidence !== "all" && h.confidence !== filters.confidence) {
      return false;
    }
    if (filters.minFrp !== undefined && h.frp < filters.minFrp) {
      return false;
    }
    if (filters.daynight && filters.daynight !== "all" && h.daynight !== filters.daynight) {
      return false;
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchId = h.id.toLowerCase().includes(q);
      const matchProv = h.province.toLowerCase().includes(q);
      const matchCoord = `${h.latitude},${h.longitude}`.includes(q);
      if (!matchId && !matchProv && !matchCoord) return false;
    }
    return true;
  });
}

export function getHotspotStats(hotspots: Hotspot[]) {
  const total = hotspots.length;
  if (total === 0) {
    return {
      total: 0,
      highConfidence: 0,
      nominalConfidence: 0,
      lowConfidence: 0,
      totalFrp: 0,
      avgFrp: 0,
      maxFrp: 0,
      provinces: {},
    };
  }

  let totalFrp = 0;
  let maxFrp = 0;
  let highConf = 0;
  let nominalConf = 0;
  let lowConf = 0;
  const provMap: Record<string, number> = {};

  for (const h of hotspots) {
    totalFrp += h.frp;
    if (h.frp > maxFrp) maxFrp = h.frp;
    if (h.confidence === "high") highConf++;
    else if (h.confidence === "nominal") nominalConf++;
    else lowConf++;

    provMap[h.province] = (provMap[h.province] || 0) + 1;
  }

  return {
    total,
    highConfidence: highConf,
    nominalConfidence: nominalConf,
    lowConfidence: lowConf,
    totalFrp: Math.round(totalFrp * 10) / 10,
    avgFrp: Math.round((totalFrp / total) * 10) / 10,
    maxFrp: Math.round(maxFrp * 10) / 10,
    provinces: provMap,
  };
}
