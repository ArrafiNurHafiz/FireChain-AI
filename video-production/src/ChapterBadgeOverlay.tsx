import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { CHAPTER_CUES } from "./types";

export const ChapterBadgeOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentChapter = CHAPTER_CUES.find(
    (c) => frame >= c.fromFrame && frame <= c.toFrame
  );

  if (!currentChapter) return null;

  const localFrame = frame - currentChapter.fromFrame;
  const chapterDuration = currentChapter.toFrame - currentChapter.fromFrame;

  // Spring entrance for chapter switch
  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 13, mass: 0.6 },
  });

  // Exit transition towards end of scene
  const exitProgress = interpolate(
    localFrame,
    [chapterDuration - 15, chapterDuration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = Math.min(enterSpring, exitProgress);
  const translateX = interpolate(enterSpring, [0, 1], [-40, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 28,
        opacity,
        transform: `translateX(${translateX}px)`,
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
      {/* Chapter Number Badge */}
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
        {currentChapter.number}
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
            {currentChapter.title}
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
        <div
          style={{
            color: "#94a3b8",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.5px",
            marginTop: 2,
          }}
        >
          {currentChapter.subtitle}
        </div>
      </div>
    </div>
  );
};
