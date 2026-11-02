import { describe, expect, it } from "vitest";
import {
  fitContain,
  getFlipTransform,
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
