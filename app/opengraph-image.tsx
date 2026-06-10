import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Junk Removal Guide — 1-800-GOT-JUNK? Reviews, Pricing & Tips";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #16a34a, #166534)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 110, marginBottom: 20 }}>🗑️</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 16 }}>Junk Removal Guide</div>
        <div style={{ fontSize: 32, color: "#bbf7d0" }}>
          1-800-GOT-JUNK? Reviews · Pricing · Tips
        </div>
      </div>
    ),
    { ...size }
  );
}
