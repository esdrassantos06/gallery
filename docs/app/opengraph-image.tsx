import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "gallery, an accessible React lightbox that flies out of your thumbnails";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fonts = join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans");

/** Social preview shared by every page: the flight mark, the name and the tagline. */
export default async function OpengraphImage() {
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
          <path
            d="M11 42 25 12M22 53 53 40"
            stroke="#f6f5f2"
            strokeOpacity=".5"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <rect
            x="25"
            y="12"
            width="28"
            height="28"
            rx="3"
            stroke="#f6f5f2"
            strokeWidth="3"
            fill="none"
          />
          <rect x="11" y="42" width="11" height="11" rx="2" fill="#f6f5f2" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 64, fontWeight: 600, letterSpacing: -1.5 }}>gallery</span>
          <span style={{ fontSize: 28, color: "#5c5f66" }}>@esdrassantos06/gallery</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
        <span style={{ fontSize: 76, fontWeight: 600, letterSpacing: -1, lineHeight: 1.05 }}>
          A lightbox that flies out of your thumbnails.
        </span>
        <span style={{ fontSize: 32, color: "#5c5f66" }}>
          Accessible React viewer with zoom, video and grids.
        </span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
