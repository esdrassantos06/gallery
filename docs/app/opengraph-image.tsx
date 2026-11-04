import { ogSize, renderCard } from "@/lib/og";

export const dynamic = "force-static";
export const alt = "liftbox, an accessible React lightbox that flies out of your thumbnails";
export const size = ogSize;
export const contentType = "image/png";

/** Social preview of the home page. */
export default function OpengraphImage() {
  return renderCard(
    "A lightbox that flies out of your thumbnails.",
    "Accessible React viewer with zoom, video and grids.",
  );
}
