// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GalleryFilter, JustifiedGrid, Lightbox, MasonryGrid, UniformGrid } from "./index";

const slides = [
  { src: "/a.jpg", width: 1500, height: 1000, alt: "A" },
  { src: "/b.jpg", width: 1000, height: 1500, alt: "B" },
];

describe("server rendering", () => {
  it("imports and renders without touching browser globals", () => {
    expect(typeof window).toBe("undefined");
    const html = renderToString(
      <Lightbox slides={[{ src: "/a.jpg", alt: "A" }]} open onClose={() => {}} />,
    );
    expect(html).toBe("");
  });

  it.each([
    ["MasonryGrid", MasonryGrid],
    ["JustifiedGrid", JustifiedGrid],
    ["UniformGrid", UniformGrid],
  ] as const)("renders %s on the server at defaultContainerWidth", (_, Grid) => {
    const html = renderToString(
      <Grid slides={slides} onOpen={() => {}} defaultContainerWidth={900} />,
    );
    expect(html).toContain('aria-label="Open A"');
    expect(html).toContain('loading="lazy"');
  });

  it("renders the filter on the server", () => {
    const html = renderToString(
      <GalleryFilter categories={["x"]} value={null} onChange={() => {}} count={2} />,
    );
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("2 images");
  });
});
