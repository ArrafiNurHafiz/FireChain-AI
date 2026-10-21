import { WeatherData } from "./types";
import initialSnapshot from "../data/weather_snapshot.json";

export const PROVINCE_COORDINATES: Record<string, { lat: number; lon: number; city: string }> = {
  "Kalimantan Tengah": { lat: -2.21, lon: 113.92, city: "Palangka Raya" },
  "Kalimantan Barat": { lat: -0.02, lon: 109.34, city: "Pontianak" },
  "Kalimantan Selatan": { lat: -3.32, lon: 114.59, city: "Banjarmasin" },
  "Kalimantan Timur": { lat: -0.50, lon: 117.15, city: "Samarinda" },
  "Kalimantan Utara": { lat: 2.84, lon: 117.37, city: "Tanjung Selor" },
};

export async function fetchLiveWeather(provinceName: string): Promise<WeatherData> {
  const meta = PROVINCE_COORDINATES[provinceName] || PROVINCE_COORDINATES["Kalimantan Tengah"];
  
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${meta.lat}&longitude=${meta.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,surface_pressure`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.statusText}`);
    const data = await res.json();
    const curr = data.current;

    return {
      city: meta.city,
      province: provinceName,
      lat: meta.lat,
      lon: meta.lon,
      temp: curr.temperature_2m,
      humidity: curr.relative_humidity_2m,
      rain: curr.precipitation,
      wind_speed: curr.wind_speed_10m,
      pressure: curr.surface_pressure,
      updated_at: curr.time || new Date().toISOString(),
    };
  } catch (err) {
    console.warn(`Fallback to snapshot for ${provinceName}:`, err);
    const snap = (initialSnapshot as Record<string, any>)[provinceName] || (initialSnapshot as Record<string, any>)["Kalimantan Tengah"];
    return {
      city: snap.city,
      province: provinceName,
      lat: snap.lat,
      lon: snap.lon,
      temp: snap.temp,
      humidity: snap.humidity,
      rain: snap.rain,
      wind_speed: snap.wind_speed,
      pressure: snap.pressure,
      updated_at: new Date().toISOString(),
    };
  }
}

export async function fetchAllProvincesWeather(): Promise<Record<string, WeatherData>> {
  const entries = Object.keys(PROVINCE_COORDINATES);
  const results: Record<string, WeatherData> = {};

  await Promise.all(
    entries.map(async (prov) => {
      results[prov] = await fetchLiveWeather(prov);
    })
  );

  return results;
}
