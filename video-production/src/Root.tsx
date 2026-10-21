import React from "react";
import { Composition } from "remotion";
import { SceneComponent } from "./SceneComponent";
import { ChapterCue, SubtitleCue } from "./types";

const SCENE1_CHAPTER: ChapterCue = {
  fromFrame: 0,
  toFrame: 1109,
  number: "01",
  title: "SATELLITE DETECTION & PEATNET EARLY WARNING",
  subtitle: "NASA FIRMS VIIRS 375m & AI Neural Inference",
};

const SCENE1_SUBS: SubtitleCue[] = [
  {
    fromFrame: 15,
    toFrame: 350,
    text: "Across the vulnerable tropical peatlands of Kalimantan, early detection and transparent verification are essential for global climate action.",
    accentKeywords: ["tropical peatlands", "early detection", "climate action"],
  },
  {
    fromFrame: 350,
    toFrame: 680,
    text: "FireChain AI integrates live NASA FIRMS satellite telemetry with decentralized blockchain technology.",
    accentKeywords: ["FireChain AI", "NASA FIRMS", "blockchain technology"],
  },
  {
    fromFrame: 680,
    toFrame: 1100,
    text: "As the Suomi-NPP VIIRS satellite passes overhead, the system ingests thousands of thermal anomalies, predicting subterranean smoldering ignition risk.",
    accentKeywords: ["Suomi-NPP VIIRS", "thermal anomalies", "smoldering ignition risk"],
  },
];

const SCENE2_CHAPTER: ChapterCue = {
  fromFrame: 0,
  toFrame: 1060,
  number: "02",
  title: "SPATIAL TARGETING & 60 FPS GPU SATELLITE MAP",
  subtitle: "High-Res ESRI Satellite & Canvas Architecture",
};

const SCENE2_SUBS: SubtitleCue[] = [
  {
    fromFrame: 15,
    toFrame: 340,
    text: "Next: precision spatial targeting. Operators launch the high-resolution ESRI satellite Live Map, powered by a 60 FPS GPU Canvas rendering engine.",
    accentKeywords: ["spatial targeting", "ESRI satellite", "60 FPS GPU Canvas"],
  },
  {
    fromFrame: 340,
    toFrame: 670,
    text: "By toggling the Critical Priority filter, the team immediately isolates extreme hotspots exceeding 20 Megawatts.",
    accentKeywords: ["Critical Priority", "20 Megawatts"],
  },
  {
    fromFrame: 670,
    toFrame: 1050,
    text: "The Hotspot Inspector reveals exact GPS coordinates, brightness temperature, and automated AI PeatNet containment directives over Kalimantan's deep peat zones.",
    accentKeywords: ["GPS coordinates", "brightness temperature", "AI PeatNet"],
  },
];

const SCENE3_CHAPTER: ChapterCue = {
  fromFrame: 0,
  toFrame: 1015,
  number: "03",
  title: "TASKFORCE MOBILIZATION & ON-CHAIN REGISTRY",
  subtitle: "Tamper-Proof Incident Logging on Polygon Amoy",
};

const SCENE3_SUBS: SubtitleCue[] = [
  {
    fromFrame: 15,
    toFrame: 330,
    text: "From this spatial intelligence, operators file an official field incident report. Exact GPS coordinates, peat depth, vegetation status, and severity are logged.",
    accentKeywords: ["field incident report", "GPS coordinates", "severity"],
  },
  {
    fromFrame: 330,
    toFrame: 680,
    text: "What sets FireChain AI apart: every report is cryptographically hashed with SHA-256 and anchored directly to the Polygon Amoy blockchain.",
    accentKeywords: ["FireChain AI", "SHA-256", "Polygon Amoy blockchain"],
  },
  {
    fromFrame: 680,
    toFrame: 1005,
    text: "Field status transitions to Response Active as Manggala Agni firefighting units deploy with high-pressure trench pumps.",
    accentKeywords: ["Response Active", "Manggala Agni", "firefighting units"],
  },
];

const SCENE4_CHAPTER: ChapterCue = {
  fromFrame: 0,
  toFrame: 1173,
  number: "04",
  title: "CONSENSUS AUDIT & IPCC CARBON CREDITS",
  subtitle: "Web Crypto SHA-256 Verifier & Tier 2 Carbon Accounting",
};

const SCENE4_SUBS: SubtitleCue[] = [
  {
    fromFrame: 15,
    toFrame: 330,
    text: "Every operational action remains publicly verifiable and tamper-proof across international observers.",
    accentKeywords: ["publicly verifiable", "tamper-proof"],
  },
  {
    fromFrame: 330,
    toFrame: 700,
    text: "In the Blockchain Audit Trail, operators execute full SHA-256 consensus verification to prove immutable chain integrity with Polygonscan links.",
    accentKeywords: ["Blockchain Audit Trail", "SHA-256 consensus", "Polygonscan"],
  },
  {
    fromFrame: 700,
    toFrame: 1165,
    text: "Finally, the IPCC Tier 2 Carbon Accounting module calculates avoided greenhouse gas emissions, turning rapid ground suppression into certified, high-integrity carbon credits.",
    accentKeywords: ["IPCC Tier 2 Carbon Accounting", "avoided emissions", "carbon credits"],
  },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Scene1"
        component={SceneComponent}
        durationInFrames={1109}
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
        durationInFrames={1060}
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
        durationInFrames={1015}
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
        durationInFrames={1173}
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
