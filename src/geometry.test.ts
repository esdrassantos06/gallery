import { describe, expect, it } from "vitest";
import {
  fitContain,
  flipMedia,
  getCrop,
  parseRadius,
  getFlipTransform,
  getMediaTransform,
  getSlideWindow,
  relativeOffset,
  wrapIndex,
} from "./geometry";

describe("fitContain", () => {
  it("scales a landscape image down to the box width", () => {
    expect(fitContain(2000, 1000, 1000, 800)).toEqual({ width: 1000, height: 500 });
  });

  it("scales a portrait image down to the box height", () => {
    expect(fitContain(1000, 2000, 1000, 800)).toEqual({ width: 400, height: 800 });
  });

  it("never upscales past the natural size", () => {
    expect(fitContain(300, 200, 1000, 800)).toEqual({ width: 300, height: 200 });
  });

  it("returns the box when the natural size is unknown", () => {
    expect(fitContain(0, 0, 1000, 800)).toEqual({ width: 1000, height: 800 });
  });
});

describe("wrapIndex", () => {
  it("wraps forward and backward", () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(2, 5)).toBe(2);
  });
});

describe("relativeOffset", () => {
  it("is the plain difference without loop", () => {
    expect(relativeOffset(0, 4, 5, false)).toBe(-4);
    expect(relativeOffset(4, 0, 5, false)).toBe(4);
  });

  it("takes the shortest way round with loop", () => {
    expect(relativeOffset(0, 4, 5, true)).toBe(1);
    expect(relativeOffset(4, 0, 5, true)).toBe(-1);
    expect(relativeOffset(2, 0, 5, true)).toBe(2);
  });
});

describe("getFlipTransform", () => {
  it("scales uniformly to cover the origin and moves the centers together", () => {
    const from = { left: 10, top: 10, width: 100, height: 100 };
    const to = { left: 200, top: 100, width: 800, height: 500 };
    expect(getFlipTransform(from, to)).toEqual({ x: -540, y: -290, scale: 0.2 });
  });

  it("is the identity for the same rect", () => {
    const rect = { left: 5, top: 5, width: 40, height: 20 };
    expect(getFlipTransform(rect, rect)).toEqual({ x: 0, y: 0, scale: 1 });
  });
});

describe("getSlideWindow", () => {
  const indexes = (w: { index: number }[]) => w.map((s) => s.index);

  it("mounts the current slide and its neighbors, sorted by index", () => {
    expect(getSlideWindow(5, 12, 1, false)).toEqual([
      { index: 4, offset: -1 },
      { index: 5, offset: 0 },
      { index: 6, offset: 1 },
    ]);
  });

  it("clips at the ends without loop", () => {
    expect(indexes(getSlideWindow(0, 12, 2, false))).toEqual([0, 1, 2]);
    expect(indexes(getSlideWindow(11, 12, 2, false))).toEqual([9, 10, 11]);
  });

  it("wraps with loop, keeping the shortest offset", () => {
    const window = getSlideWindow(0, 12, 2, true);
    expect(indexes(window)).toEqual([0, 1, 2, 10, 11]);
    expect(window.find((s) => s.index === 11)?.offset).toBe(-1);
  });

  it("never mounts a slide twice in a short gallery", () => {
    expect(getSlideWindow(0, 3, 2, true)).toEqual([
      { index: 0, offset: 0 },
      { index: 1, offset: 1 },
      { index: 2, offset: -1 },
    ]);
  });

  it("is empty for an empty gallery", () => {
    expect(getSlideWindow(0, 0, 2, true)).toEqual([]);
  });
});

describe("flipMedia", () => {
  const none = { x: 1, y: 1 } as const;

  it("flips the requested axis when upright or upside down", () => {
    expect(flipMedia(none, 0, "horizontal")).toEqual({ x: -1, y: 1 });
    expect(flipMedia(none, 180, "vertical")).toEqual({ x: 1, y: -1 });
  });

  it("flips the other image axis on quarter turns, so the flip still reads on screen", () => {
    expect(flipMedia(none, 90, "horizontal")).toEqual({ x: 1, y: -1 });
    expect(flipMedia(none, -90, "vertical")).toEqual({ x: -1, y: 1 });
    expect(flipMedia(none, 450, "horizontal")).toEqual({ x: 1, y: -1 });
  });

  it("undoes itself", () => {
    expect(flipMedia(flipMedia(none, 0, "horizontal"), 0, "horizontal")).toEqual(none);
  });
});

describe("getMediaTransform", () => {
  it("is empty at rest", () => {
    expect(getMediaTransform(0, { x: 1, y: 1 })).toBe("");
  });

  it("rotates first, then mirrors in the image's own axes", () => {
    expect(getMediaTransform(90, { x: -1, y: 1 })).toBe("rotate(90deg) scale(-1, 1)");
    expect(getMediaTransform(0, { x: 1, y: -1 })).toBe("scale(1, -1)");
    expect(getMediaTransform(-180, { x: 1, y: 1 })).toBe("rotate(-180deg)");
  });
});

describe("getCrop", () => {
  const landscape = { width: 800, height: 500 };
  const portrait = { width: 500, height: 800 };
  const square = { width: 100, height: 100 };

  it("trims the sides of a landscape image seen through a square", () => {
    expect(getCrop(landscape, square, 0.2)).toEqual({ clipPath: "inset(0px 150px)", x: 0, y: 0 });
  });

  it("trims the top and bottom of an image seen through a wide strip", () => {
    expect(getCrop(landscape, { width: 100, height: 40 }, 0.125).clipPath).toBe("inset(90px 0px)");
  });

  it("never clips when the window is larger than the media", () => {
    expect(getCrop({ width: 100, height: 100 }, { width: 300, height: 300 }, 1).clipPath).toBe(
      "inset(0px 0px)",
    );
  });

  it("rounds the corners like the window, in the media's own pixels", () => {
    expect(getCrop(landscape, square, 0.2, 8).clipPath).toBe("inset(0px 150px round 40px)");
  });

  it("keeps the top of a portrait for object-position top and shifts the flight down to match", () => {
    expect(getCrop(portrait, square, 0.2, 0, "50% 0%")).toEqual({
      clipPath: "inset(0px 0px 300px 0px)",
      x: 0,
      y: 30,
    });
  });

  it.each(["top", "center top", "top center"])("reads the keyword form %s", (position) => {
    expect(getCrop(portrait, square, 0.2, 0, position).clipPath).toBe("inset(0px 0px 300px 0px)");
  });

  it("keeps the right edge for object-position right", () => {
    expect(getCrop(landscape, square, 0.2, 0, "right")).toEqual({
      clipPath: "inset(0px 0px 0px 300px)",
      x: -30,
      y: 0,
    });
  });

  it("resolves pixel offsets against the overflow", () => {
    expect(getCrop(landscape, square, 0.2, 0, "0px 0px").clipPath).toBe("inset(0px 300px 0px 0px)");
    expect(getCrop(landscape, square, 0.2, 0, "-60px 0px").clipPath).toBe(
      "inset(0px 0px 0px 300px)",
    );
  });

  it("stays centered on values it cannot read", () => {
    expect(getCrop(landscape, square, 0.2, 0, "calc(100% - 10px) 0%").clipPath).toBe(
      "inset(0px 150px)",
    );
  });
});

describe("parseRadius", () => {
  it("reads pixels", () => {
    expect(parseRadius("12px", 200)).toBe(12);
  });

  it("resolves a percentage against the width", () => {
    expect(parseRadius("50%", 120)).toBe(60);
  });

  it("takes the horizontal radius of an elliptical corner", () => {
    expect(parseRadius("10px 20px", 200)).toBe(10);
  });

  it("is 0 for square or unparsable corners", () => {
    expect(parseRadius("0px", 200)).toBe(0);
    expect(parseRadius("", 200)).toBe(0);
  });
});
