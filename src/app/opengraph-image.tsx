import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { BUSINESS } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Apex Rentals — Car rental in New York";

function asset(path: string, mime: string): string | null {
  try {
    const buf = readFileSync(join(process.cwd(), path));
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default function OgImage() {
  const mark = asset("public/apex-mark.png", "image/png");
  const car = asset("public/images/fleet/gv70-1.jpg", "image/jpeg");

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#06080d",
          fontFamily: "sans-serif",
        }}
      >
        {/* car photo */}
        {car && (
          <img
            src={car}
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              objectFit: "cover",
            }}
          />
        )}

        {/* left-to-right darkening so the text side stays legible */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background:
              "linear-gradient(90deg, #06080d 0%, rgba(6,8,13,0.93) 30%, rgba(6,8,13,0.58) 54%, rgba(6,8,13,0.12) 80%, rgba(6,8,13,0) 100%)",
          }}
        />
        {/* gentle bottom vignette */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background:
              "linear-gradient(0deg, rgba(6,8,13,0.60) 0%, rgba(6,8,13,0) 42%)",
          }}
        />

        {/* content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            padding: "0 84px",
          }}
        >
          {/* logo mark */}
          {mark && (
            <img
              src={mark}
              width={131}
              height={72}
              style={{ width: 131, height: 72, objectFit: "contain" }}
            />
          )}

          {/* wordmark */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: 30 }}>
            <div
              style={{
                display: "flex",
                fontSize: 108,
                fontWeight: 700,
                letterSpacing: -2,
                color: "#f4f7fb",
                lineHeight: 1,
              }}
            >
              APEX
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 25,
                fontWeight: 500,
                letterSpacing: 19,
                color: "#6f9bff",
                marginTop: 14,
                paddingLeft: 4,
              }}
            >
              RENTALS
            </div>
          </div>

          {/* tagline */}
          <div
            style={{
              display: "flex",
              fontSize: 31,
              fontWeight: 400,
              color: "#aab4c6",
              marginTop: 30,
            }}
          >
            {`Clean, reliable cars — ${BUSINESS.tagline.toLowerCase()}.`}
          </div>

          {/* meta */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginTop: 46,
              fontSize: 26,
            }}
          >
            <div style={{ display: "flex", fontWeight: 600, color: "#e6ebf3" }}>
              {BUSINESS.phone}
            </div>
            <div style={{ display: "flex", color: "#6f9bff" }}>·</div>
            <div
              style={{
                display: "flex",
                fontWeight: 500,
                letterSpacing: 2,
                color: "#9aa6ba",
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
