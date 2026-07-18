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
          background: "#080b11",
          padding: 26,
          fontFamily: "sans-serif",
        }}
      >
        {/* inset hairline frame */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 96px",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
          }}
        >
          {/* kicker */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 46, height: 2, background: "#4d7cff" }} />
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 7,
                color: "#6a7789",
              }}
            >
              CAR RENTAL — NEW YORK CITY
            </div>
          </div>

          {/* wordmark lockup */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: 36 }}>
            <div
              style={{
                display: "flex",
                fontSize: 132,
                fontWeight: 700,
                letterSpacing: -3,
                color: "#f4f7fb",
                lineHeight: 1,
              }}
            >
              APEX
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 29,
                fontWeight: 500,
                letterSpacing: 22,
                color: "#4d7cff",
                marginTop: 16,
                paddingLeft: 5,
              }}
            >
              RENTALS
            </div>
          </div>

          {/* tagline */}
          <div
            style={{
              display: "flex",
              fontSize: 33,
              fontWeight: 400,
              color: "#8792a6",
              marginTop: 34,
            }}
          >
            {`Clean, reliable cars — ${BUSINESS.tagline.toLowerCase()}.`}
          </div>

          {/* meta */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              marginTop: 62,
              fontSize: 27,
            }}
          >
            <div style={{ display: "flex", fontWeight: 600, color: "#cdd5e2" }}>
              {BUSINESS.phone}
            </div>
            <div style={{ display: "flex", color: "#31456e" }}>·</div>
            <div
              style={{
                display: "flex",
                fontWeight: 500,
                letterSpacing: 2,
                color: "#6a7789",
              }}
            >
              NY · NJ · CT · PA
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
