import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SUBTITLE_CUES } from "./types";

export const SubtitlesOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find active cue
  const activeCue = SUBTITLE_CUES.find(
    (c) => frame >= c.fromFrame && frame <= c.toFrame
  );

  if (!activeCue) return null;

  // Compute smooth spring enter & exit
  const duration = activeCue.toFrame - activeCue.fromFrame;
  const progressInCue = frame - activeCue.fromFrame;

  // Spring in for first 12 frames
  const enterProgress = spring({
    frame: progressInCue,
    fps,
    config: { damping: 14, mass: 0.5 },
  });

  // Fade out for last 8 frames
  const exitProgress = interpolate(
    progressInCue,
    [duration - 8, duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = Math.min(enterProgress, exitProgress);
  const translateY = interpolate(enterProgress, [0, 1], [15, 0]);

  // Format text with highlighted keywords
  const renderFormattedText = () => {
    let parts: { text: string; isAccent: boolean }[] = [
      { text: activeCue.text, isAccent: false },
    ];

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
            if (split[i]) {
              nextParts.push({ text: split[i], isAccent: false });
            }
            if (i < split.length - 1) {
              nextParts.push({ text: kw, isAccent: true });
            }
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

  return (
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
          opacity,
          transform: `translateY(${translateY}px)`,
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
  );
};
