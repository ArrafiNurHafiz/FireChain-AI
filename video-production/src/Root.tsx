import React from "react";
import { Composition } from "remotion";
import { SceneComponent } from "./SceneComponent";
import { ChapterCue, SubtitleCue } from "./types";

const SCENE1_CHAPTER: ChapterCue = {
  fromFrame: 0,
  toFrame: 1030,
  number: "01",
  title: "DETEKSI SATELIT & PENILAIAN RISIKO FWI",
  subtitle: "NASA FIRMS VIIRS 375m & Open-Meteo Integration",
};

const SCENE1_SUBS: SubtitleCue[] = [
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
];

const SCENE2_CHAPTER: ChapterCue = {
  fromFrame: 0,
  toFrame: 1092,
  number: "02",
  title: "TARGETING SPASIAL & LIVE MAP 60 FPS",
  subtitle: "High-Res ESRI Satellite & GPU Canvas Architecture",
};

const SCENE2_SUBS: SubtitleCue[] = [
  {
    fromFrame: 10,
    toFrame: 270,
    text: "Langkah berikutnya: targeting spasial. Operator membuka Live Map resolusi tinggi satelit ESRI dengan engine akselerasi GPU Canvas 60 FPS.",
    accentKeywords: ["targeting spasial", "ESRI", "GPU Canvas 60 FPS"],
  },
  {
    fromFrame: 270,
    toFrame: 610,
    text: "Dengan filter prioritas kritis, tim langsung mengisolasi titik api berdaya radiasi tinggi di atas 20 Megawatt.",
    accentKeywords: ["prioritas kritis", "20 Megawatt"],
  },
  {
    fromFrame: 610,
    toFrame: 1080,
    text: "Inspektor titik panas memberikan telemetri presisi: koordinat geografis, suhu kecerahan, hingga kedalaman kesatuan hidrologis gambut.",
    accentKeywords: ["telemetri presisi", "suhu kecerahan", "hidrologis gambut"],
  },
];

const SCENE3_CHAPTER: ChapterCue = {
  fromFrame: 0,
  toFrame: 1001,
  number: "03",
  title: "MOBILISASI SATGAS & LOGGING ON-CHAIN",
  subtitle: "Tamper-Proof Incident Registry Smart Contract",
};

const SCENE3_SUBS: SubtitleCue[] = [
  {
    fromFrame: 15,
    toFrame: 270,
    text: "Dari temuan spasial ini, operator langsung menerbitkan laporan penanganan terpadu. Koordinat GPS, tingkat keparahan, dan kondisi vegetasi dicatat resmi.",
    accentKeywords: ["laporan penanganan", "Koordinat GPS"],
  },
  {
    fromFrame: 270,
    toFrame: 660,
    text: "Yang membedakan FireChain AI: setiap laporan langsung dicetak permanen ke dalam blok kriptografis blockchain yang anti manipulasi.",
    accentKeywords: ["FireChain AI", "blok kriptografis blockchain", "anti manipulasi"],
  },
  {
    fromFrame: 660,
    toFrame: 990,
    text: "Status tindakan diperbarui, dan tim posko Manggala Agni segera dimobilisasi ke lapangan.",
    accentKeywords: ["Status tindakan", "Manggala Agni", "dimobilisasi"],
  },
];

const SCENE4_CHAPTER: ChapterCue = {
  fromFrame: 0,
  toFrame: 1054,
  number: "04",
  title: "AUDIT KRIPTOGRAFIS & AKUNTANSI IKLIM",
  subtitle: "Web Crypto SHA-256 Verifier & IPCC Tier 2 Credits",
};

const SCENE4_SUBS: SubtitleCue[] = [
  {
    fromFrame: 15,
    toFrame: 260,
    text: "Setiap bukti tindakan dapat diaudit oleh publik dan pihak internasional.",
    accentKeywords: ["diaudit", "internasional"],
  },
  {
    fromFrame: 260,
    toFrame: 620,
    text: "Di menu Blockchain Audit, operator menjalankan verifikasi SHA-256 independen untuk membuktikan integritas seluruh rantai data.",
    accentKeywords: ["Blockchain Audit", "verifikasi SHA-256", "integritas"],
  },
  {
    fromFrame: 620,
    toFrame: 1040,
    text: "Terakhir, modul Akuntansi Emisi Karbon IPCC menghitung biomassa gambut yang terselamatkan, menghasilkan ribuan ton emisi yang dihindari dan siap dikonversi menjadi kredit karbon berkualitas tinggi.",
    accentKeywords: ["Akuntansi Emisi Karbon IPCC", "emisi yang dihindari", "kredit karbon"],
  },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Scene1"
        component={SceneComponent}
        durationInFrames={1030}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoSrc: "scene1.mp4",
          chapter: SCENE1_CHAPTER,
          subtitles: SCENE1_SUBS,
        }}
      />
      <Composition
        id="Scene2"
        component={SceneComponent}
        durationInFrames={1092}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoSrc: "scene2.mp4",
          chapter: SCENE2_CHAPTER,
          subtitles: SCENE2_SUBS,
        }}
      />
      <Composition
        id="Scene3"
        component={SceneComponent}
        durationInFrames={1001}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoSrc: "scene3.mp4",
          chapter: SCENE3_CHAPTER,
          subtitles: SCENE3_SUBS,
        }}
      />
      <Composition
        id="Scene4"
        component={SceneComponent}
        durationInFrames={1054}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoSrc: "scene4.mp4",
          chapter: SCENE4_CHAPTER,
          subtitles: SCENE4_SUBS,
        }}
      />
    </>
  );
};
