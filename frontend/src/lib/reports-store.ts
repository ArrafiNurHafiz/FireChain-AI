import { IncidentReport, ReportStatus, SeverityLevel } from "./types";
import { appendAuditBlock } from "./blockchain";

const REPORTS_STORAGE_KEY = "firechain_incident_reports_v1";

const INITIAL_REPORTS: IncidentReport[] = [
  {
    id: "FC-2026-0018",
    title: "Kebakaran Lahan Gambut Katingan Hilir",
    province: "Kalimantan Tengah",
    location_name: "Desa Hampalit, Kec. Katingan Hilir",
    latitude: -2.0124,
    longitude: 113.3892,
    severity: "Tinggi",
    status: "Respons Berlangsung",
    description: "Titik api terdeteksi meluas di atas lapisan gambut sedalam 2.5 meter. Tim Satgas gabungan Manggala Agni dan MPA sedang melakukan penyekatan parit air.",
    reporter_name: "Budi Santoso",
    reporter_organization: "Manggala Agni Daops Katingan",
    created_at: "2026-10-20T08:15:00.000Z",
    updated_at: "2026-10-20T14:30:00.000Z",
    block_hash: "0x8b2e4c1d7a93f18e0a459cf92106bd2f391a82e614c9c7f66a2c914a4c1de9f2",
    hotspot_id: "HS-N-2026-10-19-0605-1",
  },
  {
    id: "FC-2026-0017",
    title: "Kepulan Asap Tebal Dekat Perkebunan Sawit",
    province: "Kalimantan Barat",
    location_name: "Kec. Rasau Jaya, Kubu Raya",
    latitude: -0.2185,
    longitude: 109.3412,
    severity: "Sedang",
    status: "Terverifikasi",
    description: "Visualisasi drone mengonfirmasi kepulan asap dengan suhu permukaan 338 K. Vegetasi semak belukar terbakar, potensi merembet ke kanal sekunder.",
    reporter_name: "Dedi Prasetyo",
    reporter_organization: "Masyarakat Peduli Api (MPA)",
    created_at: "2026-10-20T09:40:00.000Z",
    updated_at: "2026-10-20T11:20:00.000Z",
    block_hash: "0x4f9a7a2e9d3a1c8f04128a9b6c4e7d1e8f66a9b05c2d3e4f7a8b9c0d1e2f3a4b",
  },
  {
    id: "FC-2026-0016",
    title: "Anomali Termal Satelit VIIRS Samboja",
    province: "Kalimantan Timur",
    location_name: "Samboja Barat, Kutai Kartanegara",
    latitude: -1.0256,
    longitude: 116.9821,
    severity: "Sedang",
    status: "Dalam Verifikasi",
    description: "Deteksi instrumen VIIRS NOAA-20 dengan FRP 14.8 MW pada koordinat penyangga IKN. Patroli udara helikopter dikerahkan untuk ground-checking.",
    reporter_name: "Siti Rahmawati",
    reporter_organization: "BPBD Prov. Kalimantan Timur",
    created_at: "2026-10-20T11:15:00.000Z",
    updated_at: "2026-10-20T11:45:00.000Z",
  },
  {
    id: "FC-2026-0015",
    title: "Laporan Warga Pembakaran Jerami Lahan Pasang Surut",
    province: "Kalimantan Selatan",
    location_name: "Anjir Muara, Barito Kuala",
    latitude: -3.1250,
    longitude: 114.4820,
    severity: "Rendah",
    status: "Selesai",
    description: "Warga melaporkan asap di pinggir jalan trans-Kalimantan. Sudah dipadamkan oleh regu pemadam gabungan setempat sebelum masuk gambut dalam.",
    reporter_name: "Ahmad Baihaki",
    reporter_organization: "Relawan Pemadam Swasta",
    created_at: "2026-10-20T07:10:00.000Z",
    updated_at: "2026-10-20T09:00:00.000Z",
  },
];

export function getIncidentReports(): IncidentReport[] {
  if (typeof window === "undefined") {
    return INITIAL_REPORTS;
  }
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REPORTS;
  } catch {
    return INITIAL_REPORTS;
  }
}

export async function createIncidentReport(data: {
  title: string;
  province: string;
  location_name: string;
  latitude: number;
  longitude: number;
  severity: SeverityLevel;
  description: string;
  reporter_name: string;
  reporter_organization: string;
  hotspot_id?: string;
}): Promise<IncidentReport> {
  const current = getIncidentReports();
  const nextNumber = current.length + 19;
  const id = `FC-2026-${String(nextNumber).padStart(4, "0")}`;
  const now = new Date().toISOString();

  // Create immutable blockchain audit block for this report creation
  const block = await appendAuditBlock("INCIDENT_CREATED", id, {
    report_id: id,
    title: data.title,
    province: data.province,
    coordinates: [data.latitude, data.longitude],
    severity: data.severity,
    reporter: `${data.reporter_name} (${data.reporter_organization})`,
    timestamp: now,
  });

  const newReport: IncidentReport = {
    id,
    ...data,
    status: "Laporan Dibuat",
    created_at: now,
    updated_at: now,
    block_hash: block.block_hash,
  };

  const updated = [newReport, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
  }

  return newReport;
}

export async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  notes?: string
): Promise<IncidentReport | null> {
  const current = getIncidentReports();
  const index = current.findIndex((r) => r.id === reportId);
  if (index === -1) return null;

  const target = current[index];
  const now = new Date().toISOString();

  // Record status transition in the cryptographic audit ledger
  const block = await appendAuditBlock("STATUS_CHANGE", reportId, {
    report_id: reportId,
    previous_status: target.status,
    new_status: newStatus,
    timestamp: now,
    notes: notes || `Transisi status menjadi ${newStatus}`,
  });

  const updatedReport: IncidentReport = {
    ...target,
    status: newStatus,
    updated_at: now,
    block_hash: block.block_hash,
  };

  current[index] = updatedReport;
  if (typeof window !== "undefined") {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(current));
  }

  return updatedReport;
}
