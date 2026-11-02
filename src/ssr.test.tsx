// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Lightbox } from "./index";

describe("server rendering", () => {
  it("imports and renders without touching browser globals", () => {
    expect(typeof window).toBe("undefined");
    const html = renderToString(
      <Lightbox slides={[{ src: "/a.jpg", alt: "A" }]} open onClose={() => {}} />,
    );
    expect(html).toBe("");
  });
});
