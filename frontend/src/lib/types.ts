export interface Hotspot {
  id: string;
  latitude: number;
  longitude: number;
  bright_ti4: number; // Brightness temperature I-4 (Kelvin)
  bright_ti5: number; // Brightness temperature I-5 (Kelvin)
  confidence: 'low' | 'nominal' | 'high';
  frp: number; // Fire Radiative Power (MW)
  acq_date: string; // YYYY-MM-DD
  acq_time: string; // HHMM
  satellite: string;
  daynight: 'D' | 'N';
  province: string;
}

export interface PeatlandZone {
  id: string;
  name: string;
  province: string;
  depth_class: string;
  area_ha: number;
  carbon_density_ton_ha: number;
  coordinates: [number, number][];
}

export interface WeatherData {
  city: string;
  province: string;
  lat: number;
  lon: number;
  temp: number; // Celsius
  humidity: number; // %
  rain: number; // mm
  wind_speed: number; // km/h
  pressure: number; // hPa
  updated_at: string;
}

export interface FWIResult {
  ffmc: number; // Fine Fuel Moisture Code (0 - 101)
  isi: number;  // Initial Spread Index
  risk_score: number; // 0 - 100
  level: 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi' | 'Ekstrem';
  factors: {
    satellite_hotspots: number;
    weather_dryness: number;
    peatland_proximity: number;
    wind_factor: number;
    vegetation_density: number;
  };
  summary: string;
}

export type ReportStatus = 'Laporan Dibuat' | 'Dalam Verifikasi' | 'Terverifikasi' | 'Respons Berlangsung' | 'Selesai';
export type SeverityLevel = 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi';

export interface IncidentReport {
  id: string;
  title: string;
  province: string;
  location_name: string;
  latitude: number;
  longitude: number;
  severity: SeverityLevel;
  status: ReportStatus;
  description: string;
  reporter_name: string;
  reporter_organization: string;
  created_at: string;
  updated_at: string;
  block_hash?: string;
  hotspot_id?: string;
}

export interface AuditBlock {
  index: number;
  timestamp: string;
  record_type: 'GENESIS' | 'HOTSPOT_CLUSTER' | 'INCIDENT_CREATED' | 'STATUS_CHANGE' | 'RESPONSE_DISPATCH' | 'CARBON_VERIFIED';
  entity_id: string;
  payload: Record<string, unknown>;
  payload_hash: string;
  previous_hash: string;
  block_hash: string;
  validator: string;
}

export interface EmissionCalculation {
  total_hotspots: number;
  total_frp_mw: number;
  estimated_burned_area_ha: number;
  biomass_consumed_ton: number;
  gross_emissions_tco2e: number;
  avoided_emissions_tco2e: number;
  ch4_tco2e: number;
  co2_tco2e: number;
  co_tco2e: number;
  n2o_tco2e: number;
}
