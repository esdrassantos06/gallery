import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

const fonts = join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans");

/** Social card with the flight mark, the name, a headline and a subtitle. */
export async function renderCard(headline: string, subtitle: string) {
  const [regular, semibold] = await Promise.all([
    readFile(join(fonts, "Geist-Regular.ttf")),
    readFile(join(fonts, "Geist-SemiBold.ttf")),
  ]);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#f6f5f2",
        color: "#0b0b0c",
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <svg width="112" height="112" viewBox="0 0 64 64">
          <rect width="64" height="64" rx="14" fill="#0b0b0c" />
          <rect
            x="17.8"
            y="25.8"
            width="20.5"
            height="20.5"
            rx="2.5"
            stroke="#f6f5f2"
            strokeOpacity=".38"
            strokeWidth="2.5"
            fill="none"
          />
          <rect
            x="25"
            y="11"
            width="28"
            height="28"
            rx="3.4"
            stroke="#f6f5f2"
            strokeWidth="3.5"
            fill="none"
          />
          <rect x="10.5" y="40.5" width="13" height="13" rx="2" fill="#f6f5f2" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 64, fontWeight: 600, letterSpacing: -1.5 }}>liftbox</span>
          <span style={{ fontSize: 28, color: "#5c5f66" }}>liftbox.digital</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
        <span style={{ fontSize: 76, fontWeight: 600, letterSpacing: -1, lineHeight: 1.05 }}>
          {headline}
        </span>
        <span style={{ fontSize: 32, color: "#5c5f66" }}>{subtitle}</span>
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
