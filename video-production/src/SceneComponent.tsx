import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { ChapterCue, SubtitleCue } from "./types";
import { TelemetryHUDOverlay } from "./TelemetryHUDOverlay";

interface SceneProps {
  videoSrc: string;
  chapter: ChapterCue;
  subtitles: SubtitleCue[];
}

export const SceneComponent: React.FC<SceneProps> = ({ videoSrc, chapter, subtitles }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 1. Chapter badge spring transition
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 13, mass: 0.6 },
  });

  const exitProgress = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const badgeOpacity = Math.min(enterSpring, exitProgress);
  const badgeTranslateX = interpolate(enterSpring, [0, 1], [-40, 0]);

  // 2. Active subtitle
  const activeCue = subtitles.find((c) => frame >= c.fromFrame && frame <= c.toFrame);

  // Subtitle formatting with highlights
  const renderFormattedText = () => {
    if (!activeCue) return null;
    let parts: { text: string; isAccent: boolean }[] = [{ text: activeCue.text, isAccent: false }];

    if (activeCue.accentKeywords && activeCue.accentKeywords.length > 0) {
      for (const kw of activeCue.accentKeywords) {
        const nextParts: typeof parts = [];
        for (const p of parts) {
          if (p.isAccent) {
            nextParts.push(p);
            continue;
          }
          const split = p.text.split(kw);
          for (let i = 0; i < split.length; i++) {
            if (split[i]) nextParts.push({ text: split[i], isAccent: false });
            if (i < split.length - 1) nextParts.push({ text: kw, isAccent: true });
          }
        }
        parts = nextParts;
      }
    }

    return (
      <span>
        {parts.map((p, idx) =>
          p.isAccent ? (
            <span
              key={idx}
              style={{
                color: "#ffedd5",
                fontWeight: 800,
                textShadow: "0 0 14px rgba(249, 115, 22, 0.9), 0 0 4px #ef4444",
                padding: "0 3px",
              }}
            >
              {p.text}
            </span>
          ) : (
            <span key={idx}>{p.text}</span>
          )
        )}
      </span>
    );
  };

  // Subtitle enter/exit animation
  let subOpacity = 0;
  let subTranslateY = 15;
  if (activeCue) {
    const cueDuration = activeCue.toFrame - activeCue.fromFrame;
    const progressInCue = frame - activeCue.fromFrame;
    const subEnter = spring({
      frame: progressInCue,
      fps,
      config: { damping: 14, mass: 0.5 },
    });
    const subExit = interpolate(
      progressInCue,
      [cueDuration - 8, cueDuration],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    subOpacity = Math.min(subEnter, subExit);
    subTranslateY = interpolate(subEnter, [0, 1], [15, 0]);
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#09090b" }}>
      {/* 1. Underlying Base Video */}
      <OffthreadVideo
        src={staticFile(videoSrc)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* 2. Telemetry HUD Corner Overlays */}
      <TelemetryHUDOverlay />

      {/* 3. Chapter Badge Overlay */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          opacity: badgeOpacity,
          transform: `translateX(${badgeTranslateX}px)`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          backgroundColor: "rgba(12, 12, 18, 0.9)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(239, 68, 68, 0.5)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.7), 0 0 16px rgba(239, 68, 68, 0.25)",
          borderRadius: 14,
          padding: "10px 18px",
          pointerEvents: "none",
          zIndex: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.8) 0%, rgba(249, 115, 22, 0.9) 100%)",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: 16,
            fontFamily: "monospace",
            boxShadow: "0 0 12px rgba(239, 68, 68, 0.6)",
          }}
        >
          {chapter.number}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                color: "#f87171",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "1.5px",
                fontFamily: "monospace",
                textTransform: "uppercase",
              }}
            >
              {chapter.title}
            </span>
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                boxShadow: "0 0 8px #22c55e",
              }}
            />
          </div>
          <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 500, letterSpacing: "0.5px", marginTop: 2 }}>
            {chapter.subtitle}
          </div>
        </div>
      </div>

      {/* 4. Subtitle Layer */}
      {activeCue && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 50,
          }}
        >
          <div
            style={{
              opacity: subOpacity,
              transform: `translateY(${subTranslateY}px)`,
              maxWidth: "76%",
              backgroundColor: "rgba(10, 10, 15, 0.88)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(239, 68, 68, 0.2)",
              borderRadius: 24,
              padding: "14px 32px",
              textAlign: "center",
              color: "#f8fafc",
              fontSize: 22,
              fontWeight: 600,
              lineHeight: 1.45,
              letterSpacing: "0.2px",
            }}
          >
            {renderFormattedText()}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
