import { ImageResponse } from "next/og";
import { BUSINESS } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Apex Rentals — Car rental in New York";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(ellipse 70% 60% at 70% 15%, #16264d 0%, #05070d 60%)",
          color: "#eef2f9",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#5b8cff",
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: 8,
          }}
        >
          <div style={{ width: 60, height: 3, background: "#2f6bff" }} />
          CAR RENTAL · NEW YORK CITY
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 24,
            marginTop: 28,
          }}
        >
          <span style={{ fontSize: 128, fontWeight: 800, letterSpacing: -2 }}>
            APEX
          </span>
          <span
            style={{ fontSize: 56, fontWeight: 700, letterSpacing: 18, color: "#5b8cff" }}
          >
            RENTALS
          </span>
        </div>

        <div style={{ display: "flex", fontSize: 40, color: "#93a0b8", marginTop: 12 }}>
          {`Clean, reliable cars — ${BUSINESS.tagline.toLowerCase()}.`}
        </div>

        <div
          style={{
            display: "flex",
            gap: 28,
            marginTop: 56,
            fontSize: 30,
            color: "#eef2f9",
          }}
        >
          <span>{BUSINESS.phone}</span>
          <span style={{ color: "#2f6bff" }}>·</span>
          <span style={{ color: "#93a0b8" }}>NY · NJ · CT · PA</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
