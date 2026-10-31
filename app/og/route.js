import { ImageResponse } from "next/og"

export const dynamic = "force-static"

/** 1200x630 social preview used by Open Graph and Twitter cards. */
export function GET() {
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
          background: "#F7F8FA",
          color: "#111827",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 28,
              background: "#16A34A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 48, height: 60, background: "#FFFFFF", borderRadius: 8, display: "flex" }} />
          </div>
          <div style={{ marginLeft: 28, fontSize: 72, fontWeight: 800, display: "flex" }}>PaperLess</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 64, fontWeight: 800, lineHeight: 1.1, display: "flex" }}>
          Free online PDF tools, without the paperwork.
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: "#6B7280", display: "flex" }}>
          Merge · Split · Compress · Convert
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
