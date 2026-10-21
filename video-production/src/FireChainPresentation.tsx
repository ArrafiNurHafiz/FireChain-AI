import React from "react";
import { AbsoluteFill, Series, OffthreadVideo, staticFile } from "remotion";
import { ChapterBadgeOverlay } from "./ChapterBadgeOverlay";
import { SubtitlesOverlay } from "./SubtitlesOverlay";
import { TelemetryHUDOverlay } from "./TelemetryHUDOverlay";

export const FireChainPresentation: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#09090b" }}>
      {/* 1. Underlying Recorded Operation Video Tracks */}
      <Series>
        {/* Scene 1: Dashboard, KPIs, Live Sync, Weather & FWI */}
        <Series.Sequence durationInFrames={1030}>
          <OffthreadVideo
            src={staticFile("scene1.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Series.Sequence>

        {/* Scene 2: Live Map, Filter Kritis, flyTo KalTeng, Hotspot Inspector */}
        <Series.Sequence durationInFrames={1092}>
          <OffthreadVideo
            src={staticFile("scene2.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Series.Sequence>

        {/* Scene 3: Form Laporan Kejadian, Minting Blok, Dispatched Satgas */}
        <Series.Sequence durationInFrames={1001}>
          <OffthreadVideo
            src={staticFile("scene3.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Series.Sequence>

        {/* Scene 4: Blockchain Audit SHA-256 Verifier & IPCC Carbon Simulator */}
        <Series.Sequence durationInFrames={1054}>
          <OffthreadVideo
            src={staticFile("scene4.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Series.Sequence>
      </Series>

      {/* 2. Top-grade Defense/Tech Telemetry Overlays */}
      <TelemetryHUDOverlay />

      {/* 3. Dynamic Chapter Badge Card (01..04) */}
      <ChapterBadgeOverlay />

      {/* 4. High-contrast Synchronized Subtitles Layer */}
      <SubtitlesOverlay />
    </AbsoluteFill>
  );
};
