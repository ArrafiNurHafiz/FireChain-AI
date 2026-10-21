export interface SubtitleCue {
  fromFrame: number;
  toFrame: number;
  text: string;
  accentKeywords?: string[];
}

export interface ChapterCue {
  fromFrame: number;
  toFrame: number;
  number: string;
  title: string;
  subtitle: string;
}

export const CHAPTER_CUES: ChapterCue[] = [
  {
    fromFrame: 0,
    toFrame: 1030,
    number: "01",
    title: "DETEKSI SATELIT & PENILAIAN RISIKO FWI",
    subtitle: "NASA FIRMS VIIRS 375m & Open-Meteo Integration",
  },
  {
    fromFrame: 1030,
    toFrame: 2122,
    number: "02",
    title: "TARGETING SPASIAL & LIVE MAP 60 FPS",
    subtitle: "High-Res ESRI Satellite & GPU Canvas Architecture",
  },
  {
    fromFrame: 2122,
    toFrame: 3123,
    number: "03",
    title: "MOBILISASI SATGAS & LOGGING ON-CHAIN",
    subtitle: "Tamper-Proof Incident Registry Smart Contract",
  },
  {
    fromFrame: 3123,
    toFrame: 4177,
    number: "04",
    title: "AUDIT KRIPTOGRAFIS & AKUNTANSI IKLIM",
    subtitle: "Web Crypto SHA-256 Verifier & IPCC Tier 2 Credits",
  },
];

export const SUBTITLE_CUES: SubtitleCue[] = [
  // Scene 1: Frames 0 to 1030
  {
    fromFrame: 10,
    toFrame: 300,
    text: "Di tengah ancaman kebakaran hutan dan lahan gambut Kalimantan, kecepatan deteksi dan transparansi adalah kunci penyelamatan iklim global.",
    accentKeywords: ["kebakaran hutan", "lahan gambut Kalimantan", "iklim global"],
  },
  {
    fromFrame: 300,
    toFrame: 620,
    text: "FireChain AI hadir memadukan telemetri satelit NASA FIRMS dan pembukuan terdesentralisasi.",
    accentKeywords: ["FireChain AI", "NASA FIRMS", "terdesentralisasi"],
  },
  {
    fromFrame: 620,
    toFrame: 1020,
    text: "Begitu satelit Suomi-NPP VIIRS melintas, sistem langsung menyerap ribuan titik anomali termal dan menghitung indeks risiko cuaca secara real-time.",
    accentKeywords: ["Suomi-NPP VIIRS", "anomali termal", "real-time"],
  },

  // Scene 2: Frames 1030 to 2122
  {
    fromFrame: 1040,
    toFrame: 1300,
    text: "Langkah berikutnya: targeting spasial. Operator membuka Live Map resolusi tinggi satelit ESRI dengan engine akselerasi GPU Canvas 60 FPS.",
    accentKeywords: ["targeting spasial", "ESRI", "GPU Canvas 60 FPS"],
  },
  {
    fromFrame: 1300,
    toFrame: 1640,
    text: "Dengan filter prioritas kritis, tim langsung mengisolasi titik api berdaya radiasi tinggi di atas 20 Megawatt.",
    accentKeywords: ["prioritas kritis", "20 Megawatt"],
  },
  {
    fromFrame: 1640,
    toFrame: 2110,
    text: "Inspektor titik panas memberikan telemetri presisi: koordinat geografis, suhu kecerahan, hingga kedalaman kesatuan hidrologis gambut.",
    accentKeywords: ["telemetri presisi", "suhu kecerahan", "hidrologis gambut"],
  },

  // Scene 3: Frames 2122 to 3123
  {
    fromFrame: 2135,
    toFrame: 2390,
    text: "Dari temuan spasial ini, operator langsung menerbitkan laporan penanganan terpadu. Koordinat GPS, tingkat keparahan, dan kondisi vegetasi dicatat resmi.",
    accentKeywords: ["laporan penanganan", "Koordinat GPS"],
  },
  {
    fromFrame: 2390,
    toFrame: 2780,
    text: "Yang membedakan FireChain AI: setiap laporan langsung dicetak permanen ke dalam blok kriptografis blockchain yang anti manipulasi.",
    accentKeywords: ["FireChain AI", "blok kriptografis blockchain", "anti manipulasi"],
  },
  {
    fromFrame: 2780,
    toFrame: 3110,
    text: "Status tindakan diperbarui, dan tim posko Manggala Agni segera dimobilisasi ke lapangan.",
    accentKeywords: ["Status tindakan", "Manggala Agni", "dimobilisasi"],
  },

  // Scene 4: Frames 3123 to 4177
  {
    fromFrame: 3135,
    toFrame: 3380,
    text: "Setiap bukti tindakan dapat diaudit oleh publik dan pihak internasional.",
    accentKeywords: ["diaudit", "internasional"],
  },
  {
    fromFrame: 3380,
    toFrame: 3740,
    text: "Di menu Blockchain Audit, operator menjalankan verifikasi SHA-256 independen untuk membuktikan integritas seluruh rantai data.",
    accentKeywords: ["Blockchain Audit", "verifikasi SHA-256", "integritas"],
  },
  {
    fromFrame: 3740,
    toFrame: 4160,
    text: "Terakhir, modul Akuntansi Emisi Karbon IPCC menghitung biomassa gambut yang terselamatkan, menghasilkan ribuan ton emisi yang dihindari dan siap dikonversi menjadi kredit karbon berkualitas tinggi.",
    accentKeywords: ["Akuntansi Emisi Karbon IPCC", "emisi yang dihindari", "kredit karbon"],
  },
];
