import { FWIResult, WeatherData } from "./types";

/**
 * Canadian Forest Fire Weather Index (FWI) System Implementation.
 * Calculates FFMC (Fine Fuel Moisture Code), ISI (Initial Spread Index),
 * and aggregate fire risk score based on real weather parameters.
 */
export function calculateFWI(weather: WeatherData, hotspotCount: number = 0): FWIResult {
  const temp = weather.temp;
  const humidity = Math.min(100, Math.max(1, weather.humidity));
  const wind = Math.max(0, weather.wind_speed);
  const rain = Math.max(0, weather.rain);
  const prevFfmc = 85.0; // Standard nominal baseline

  // 1. Initial moisture content from previous FFMC
  let mo = 147.2 * (101.0 - prevFfmc) / (59.5 + prevFfmc);

  // 2. Rain effect on fuel moisture
  if (rain > 0.5) {
    const ra = rain - 0.5;
    let mr: number;
    if (mo <= 150.0) {
      mr = mo + 42.5 * ra * Math.exp(-100.0 / (251.0 - mo)) * (1.0 - Math.exp(-6.93 / ra));
    } else {
      mr = mo + 42.5 * ra * Math.exp(-100.0 / (251.0 - mo)) * (1.0 - Math.exp(-6.93 / ra)) +
           0.0015 * Math.pow(mo - 150.0, 2) * Math.sqrt(ra);
    }
    if (mr > 250.0) mr = 250.0;
    mo = mr;
  }

  // 3. Equilibrium moisture content for drying (Ed)
  const ed = 0.942 * Math.pow(humidity, 0.679) +
             11.0 * Math.exp((humidity - 100.0) / 10.0) +
             0.18 * (21.1 - temp) * (1.0 - Math.exp(-0.115 * humidity));

  // 4. Drying rate (kd)
  const ka = 0.424 * (1.0 - Math.pow(humidity / 100.0, 1.7)) +
             0.0694 * Math.sqrt(wind) * (1.0 - Math.pow(humidity / 100.0, 8.0));
  const kd = ka * 0.581 * Math.exp(0.0365 * temp);

  // 5. Final moisture content (m)
  const m = ed + (mo - ed) * Math.pow(10.0, -kd);

  // 6. Fine Fuel Moisture Code (FFMC)
  let ffmc = 59.5 * (250.0 - m) / (147.2 + m);
  ffmc = Math.max(0.0, Math.min(101.0, ffmc));

  // 7. Initial Spread Index (ISI)
  const fw = Math.exp(0.05039 * wind);
  const ff = 91.9 * Math.exp(-0.1386 * m) * (1.0 + Math.pow(m, 5.31) / 49300000.0);
  const isi = 0.208 * fw * ff;

  // 8. Multi-factor weighted risk score (0 - 100)
  // Factors: FFMC (dryness), ISI (wind spread), satellite hotspots, peatland factor
  const weatherDryness = Math.round(Math.min(100, Math.max(0, (ffmc - 50) * 2)));
  const windFactor = Math.round(Math.min(100, (wind / 30) * 100));
  const satelliteFactor = Math.min(100, Math.round(hotspotCount > 0 ? Math.min(100, 40 + hotspotCount * 0.5) : 25));
  const peatlandFactor = 85; // Kalimantan peatland high vulnerability constant
  const vegetationDensity = 72;

  // Composite risk score
  const compositeScore = Math.round(
    weatherDryness * 0.35 +
    windFactor * 0.15 +
    satelliteFactor * 0.30 +
    peatlandFactor * 0.20
  );

  const finalScore = Math.min(100, Math.max(10, compositeScore));

  let level: FWIResult['level'] = 'Rendah';
  if (finalScore >= 80) {
    level = 'Sangat Tinggi';
  } else if (finalScore >= 65) {
    level = 'Tinggi';
  } else if (finalScore >= 45) {
    level = 'Sedang';
  }

  let summary = 'Kondisi kelembapan cukup aman. Risiko kebakaran rendah.';
  if (level === 'Sangat Tinggi') {
    summary = 'Kombinasi cuaca sangat kering, angin kencang, dan indikasi hotspot aktif pada lahan gambut. Sangat disarankan siaga darurat.';
  } else if (level === 'Tinggi') {
    summary = 'Terdapat indikasi kuat potensi eskalasi api pada lahan gambut kering. Disarankan patroli terpadu dan pembasahan lahan.';
  } else if (level === 'Sedang') {
    summary = 'Kondisi cuaca memerlukan pemantauan berkala. Tim respons lapangan diimbau bersiap siaga.';
  }

  return {
    ffmc: Math.round(ffmc * 10) / 10,
    isi: Math.round(isi * 100) / 100,
    risk_score: finalScore,
    level,
    factors: {
      satellite_hotspots: satelliteFactor,
      weather_dryness: weatherDryness,
      peatland_proximity: peatlandFactor,
      wind_factor: windFactor,
      vegetation_density: vegetationDensity,
    },
    summary,
  };
}
