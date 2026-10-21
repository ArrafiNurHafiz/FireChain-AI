import { createServerFn } from "@tanstack/react-start";
import { Hotspot } from "./types";
import rawSnapshot from "../data/kalimantan_hotspots.json";

let cachedHotspots: Hotspot[] = rawSnapshot as Hotspot[];
let lastFetchedTime: number = Date.now();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 menit TTL

export interface SyncResponse {
  hotspots: Hotspot[];
  lastUpdated: string;
  isLive: boolean;
  source: string;
  total: number;
}

export const fetchLiveFirmsHotspots = createServerFn({ method: "GET" })
  .validator((d?: { force?: boolean }) => d || {})
  .handler(async ({ data }): Promise<SyncResponse> => {
    const now = Date.now();
    const shouldFetch = data?.force || now - lastFetchedTime > CACHE_TTL_MS;

    if (!shouldFetch && cachedHotspots.length > 0) {
      return {
        hotspots: cachedHotspots,
        lastUpdated: new Date(lastFetchedTime).toISOString(),
        isLive: false,
        source: "in-memory-cache",
        total: cachedHotspots.length,
      };
    }

    try {
      const url =
        "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_SouthEast_Asia_24h.csv";
      const res = await fetch(url, {
        headers: { "User-Agent": "FireChain-AI/1.0" },
      });

      if (!res.ok) {
        throw new Error(`NASA FIRMS HTTP ${res.status}`);
      }

      const text = await res.text();
      const lines = text.trim().split("\n");

      const parsed: Hotspot[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",");
        if (parts.length < 12) continue;
        const lat = parseFloat(parts[0]);
        const lon = parseFloat(parts[1]);

        // Filter Kalimantan bounding box
        if (lat >= -4.5 && lat <= 4.5 && lon >= 108.5 && lon <= 119.5) {
          let prov = "Kalimantan Tengah";
          if (lon < 111.0) {
            prov = "Kalimantan Barat";
          } else if (lat < -1.5 && lon > 114.0) {
            prov = "Kalimantan Selatan";
          } else if (lat > 1.5) {
            prov = "Kalimantan Utara";
          } else if (lon > 115.0) {
            prov = "Kalimantan Timur";
          }

          parsed.push({
            id: `HS-${parts[7] || "VIIRS"}-${parts[5] || "NRT"}-${parts[6] || "0000"}-${parsed.length + 1}`,
            latitude: lat,
            longitude: lon,
            bright_ti4: parseFloat(parts[2]) || 300,
            bright_ti5: parseFloat(parts[10]) || 290,
            confidence: (parts[8] as any) || "nominal",
            frp: parseFloat(parts[11]) || 2.5,
            acq_date: parts[5] || new Date().toISOString().slice(0, 10),
            acq_time: parts[6] || "0000",
            satellite: parts[7] || "Suomi-NPP",
            daynight: (parts[12] as any) || "D",
            province: prov,
          });
        }
      }

      if (parsed.length > 0) {
        cachedHotspots = parsed;
        lastFetchedTime = now;
      }

      return {
        hotspots: cachedHotspots,
        lastUpdated: new Date(lastFetchedTime).toISOString(),
        isLive: true,
        source: "nasa-firms-nrt",
        total: cachedHotspots.length,
      };
    } catch (err) {
      console.warn("Gagal fetch NASA FIRMS live, fallback ke snapshot lokal:", err);
      return {
        hotspots: cachedHotspots,
        lastUpdated: new Date(lastFetchedTime).toISOString(),
        isLive: false,
        source: "snapshot-fallback",
        total: cachedHotspots.length,
      };
    }
  });
