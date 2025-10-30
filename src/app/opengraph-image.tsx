import { ImageResponse } from "next/og";

export const runtime = "edge";

const width = 1200;
const height = 630;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.22), rgba(3,7,17,0.95))",
          padding: "80px",
          color: "#f8fafc",
          fontFamily: "Geist, Inter, 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 18px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.2)",
            fontSize: "22px",
            textTransform: "uppercase",
            letterSpacing: "10px",
            color: "rgba(226,232,240,0.8)",
          }}
        >
          <span style={{ fontWeight: 500 }}>Society of Renewal</span>
        </div>
        <h1
          style={{
            marginTop: "36px",
            fontSize: "68px",
            fontWeight: 600,
            lineHeight: 1.05,
            maxWidth: "860px",
          }}
        >
          Join the Society of Renewal
        </h1>
        <p
          style={{
            marginTop: "24px",
            fontSize: "28px",
            maxWidth: "760px",
            color: "rgba(226,232,240,0.8)",
            lineHeight: 1.4,
          }}
        >
          Compassion as infrastructure. Transparent lotteries, need-based
          invitations, and universal basic income for every confirmed citizen.
        </p>
      </div>
    ),
    {
      width,
      height,
    },
  );
}
