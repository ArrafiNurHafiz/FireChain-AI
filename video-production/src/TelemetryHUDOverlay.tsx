import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export const TelemetryHUDOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  // Dynamic audio frequency bars simulation
  const barCount = 18;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const seed = (frame * 0.18 + i * 0.75) % (Math.PI * 2);
    const height = Math.abs(Math.sin(seed) * Math.cos(seed * 0.5)) * 26 + 6;
    return height;
  });

  // Corner reticle pulse
  const reticleAlpha = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.35, 0.75]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      {/* Top Right Live Telemetry Chip */}
      <div
        style={{
          position: "absolute",
          top: 28,
          right: 28,
          display: "flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: "rgba(10, 10, 15, 0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 12,
          padding: "8px 16px",
          color: "#e2e8f0",
          fontSize: 11,
          fontFamily: "monospace",
          letterSpacing: "0.8px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              boxShadow: "0 0 10px #ef4444",
              display: "inline-block",
            }}
          />
          <span style={{ fontWeight: 800, color: "#f87171" }}>REC // LIVE</span>
        </div>
        <span style={{ color: "#64748b" }}>|</span>
        <span>ORBIT: NOAA-20 / VIIRS NRT</span>
        <span style={{ color: "#64748b" }}>|</span>
        <span style={{ color: "#22c55e", fontWeight: 700 }}>GPU CANVAS 60FPS</span>
      </div>

      {/* Bottom Right Audio Frequency Visualizer */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          right: 36,
          display: "flex",
          alignItems: "flex-end",
          gap: 3,
          backgroundColor: "rgba(10, 10, 15, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 12,
          padding: "10px 14px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div style={{ marginRight: 8, textAlign: "right" }}>
          <div style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace", fontWeight: 700 }}>
            VOICE FREQ
          </div>
          <div style={{ fontSize: 8, color: "#64748b", fontFamily: "monospace" }}>
            48 kHz MASTERED
          </div>
        </div>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: 3.5,
              height: h,
              backgroundColor: i % 3 === 0 ? "#ef4444" : "#f97316",
              borderRadius: 2,
              boxShadow: i % 3 === 0 ? "0 0 6px rgba(239, 68, 68, 0.6)" : "none",
            }}
          />
        ))}
      </div>

      {/* Viewport Corner Reticles (Cinema / Defense Style) */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          width: 24,
          height: 24,
          borderTop: `2px solid rgba(239, 68, 68, ${reticleAlpha})`,
          borderLeft: `2px solid rgba(239, 68, 68, ${reticleAlpha})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 24,
          height: 24,
          borderTop: `2px solid rgba(239, 68, 68, ${reticleAlpha})`,
          borderRight: `2px solid rgba(239, 68, 68, ${reticleAlpha})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          width: 24,
          height: 24,
          borderBottom: `2px solid rgba(239, 68, 68, ${reticleAlpha})`,
          borderLeft: `2px solid rgba(239, 68, 68, ${reticleAlpha})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          width: 24,
          height: 24,
          borderBottom: `2px solid rgba(239, 68, 68, ${reticleAlpha})`,
          borderRight: `2px solid rgba(239, 68, 68, ${reticleAlpha})`,
        }}
      />
    </div>
  );
};
