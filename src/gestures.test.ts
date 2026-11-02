import { describe, expect, it } from "vitest";
import {
  getEdgeFrictionedDelta,
  getSwipeAxis,
  getSwipeReleaseVerdict,
  getWindowedVelocity,
  pushVelocitySample,
  shouldCloseOnVerticalDrag,
  type VelocitySample,
} from "./gestures";

describe("getSwipeAxis", () => {
  it("commits to an axis only past the 10px threshold", () => {
    expect(getSwipeAxis(10, 5, undefined)).toBeUndefined();
    expect(getSwipeAxis(11, 5, undefined)).toBe("horizontal");
    expect(getSwipeAxis(-20, 5, undefined)).toBe("horizontal");
    expect(getSwipeAxis(5, 11, undefined)).toBe("vertical");
  });

  it("is sticky once committed", () => {
    expect(getSwipeAxis(0, 100, "horizontal")).toBe("horizontal");
    expect(getSwipeAxis(100, 0, "vertical")).toBe("vertical");
  });
});

describe("getEdgeFrictionedDelta", () => {
  it("rubber-bands only when dragging into a missing neighbor", () => {
    expect(getEdgeFrictionedDelta(100, false, true)).toBe(35);
    expect(getEdgeFrictionedDelta(-100, true, false)).toBe(-35);
    expect(getEdgeFrictionedDelta(100, true, false)).toBe(100);
    expect(getEdgeFrictionedDelta(-100, false, true)).toBe(-100);
  });
});

describe("getSwipeReleaseVerdict", () => {
  const threshold = 50;

  it("navigates past the distance threshold (negative delta = next)", () => {
    expect(getSwipeReleaseVerdict({ deltaX: -60, velocityX: -0.1, threshold })).toBe("next");
    expect(getSwipeReleaseVerdict({ deltaX: 60, velocityX: 0.1, threshold })).toBe("prev");
  });

  it("snaps back below the threshold at slow speed", () => {
    expect(getSwipeReleaseVerdict({ deltaX: -40, velocityX: -0.1, threshold })).toBe("stay");
  });

  it("honors quick flicks below the distance threshold, but never taps", () => {
    expect(getSwipeReleaseVerdict({ deltaX: -40, velocityX: -0.8, threshold })).toBe("next");
    expect(getSwipeReleaseVerdict({ deltaX: -10, velocityX: -2, threshold })).toBe("stay");
  });

  it("ignores a flick whose velocity opposes the drag", () => {
    expect(getSwipeReleaseVerdict({ deltaX: -40, velocityX: 0.9, threshold })).toBe("stay");
  });

  it("navigates when momentum projects past the midpoint", () => {
    const input = { deltaX: -260, velocityX: -0.3, threshold: 400, viewportWidth: 400 };
    expect(getSwipeReleaseVerdict(input)).toBe("next");
    expect(getSwipeReleaseVerdict({ deltaX: -260, velocityX: -0.3, threshold: 400 })).toBe("stay");
  });
});

describe("shouldCloseOnVerticalDrag", () => {
  const vh = 800;

  it("closes when the projected travel passes 40% of the viewport", () => {
    expect(shouldCloseOnVerticalDrag(350, 0, vh)).toBe(true);
    expect(shouldCloseOnVerticalDrag(-350, 0, vh)).toBe(true);
  });

  it("closes on a plain drag past 20% of the viewport", () => {
    expect(shouldCloseOnVerticalDrag(170, 0, vh)).toBe(true);
    expect(shouldCloseOnVerticalDrag(150, 0, vh)).toBe(false);
  });

  it("closes on a small fast flick via momentum projection", () => {
    expect(shouldCloseOnVerticalDrag(60, 1.5, vh)).toBe(true);
    expect(shouldCloseOnVerticalDrag(-60, -1.5, vh)).toBe(true);
  });

  it("never closes on a grazed tap: velocity cannot replace travel", () => {
    expect(shouldCloseOnVerticalDrag(32, 2, vh)).toBe(false);
    expect(shouldCloseOnVerticalDrag(40, 2, vh)).toBe(true);
  });

  it("never closes when the release moves back toward rest", () => {
    expect(shouldCloseOnVerticalDrag(350, -2, vh)).toBe(false);
  });
});

function record(points: [number, number, number][]): VelocitySample[] {
  let samples: VelocitySample[] = [];
  for (const [x, y, t] of points) samples = pushVelocitySample(samples, { x, y, t });
  return samples;
}

describe("windowed velocity", () => {
  it("reads the speed of the final window, not the whole gesture", () => {
    const samples = record([
      [0, 0, 0],
      [50, 0, 500],
      [100, 0, 1000],
      [116, 0, 1016],
      [132, 0, 1032],
      [148, 0, 1048],
    ]);
    const v = getWindowedVelocity(samples, 1048);
    expect(v.x).toBeCloseTo(1, 5);
    expect(v.y).toBe(0);
  });

  it("reads zero after a pause before lifting", () => {
    const samples = record([
      [0, 0, 0],
      [80, 0, 100],
      [160, 0, 200],
    ]);
    expect(getWindowedVelocity(samples, 500)).toEqual({ x: 0, y: 0 });
  });

  it("reads zero for sub-pixel drift, single samples and too short spans", () => {
    expect(
      getWindowedVelocity(
        record([
          [0, 0, 0],
          [0.5, 0.5, 50],
        ]),
        50,
      ),
    ).toEqual({ x: 0, y: 0 });
    expect(getWindowedVelocity(record([[10, 10, 0]]), 0)).toEqual({ x: 0, y: 0 });
    expect(
      getWindowedVelocity(
        record([
          [0, 0, 1000],
          [60, 0, 1000.4],
        ]),
        1000.4,
      ),
    ).toEqual({ x: 0, y: 0 });
  });

  it("keeps the buffer pruned to the window", () => {
    const samples = record([
      [0, 0, 0],
      [10, 0, 40],
      [20, 0, 80],
      [30, 0, 120],
      [40, 0, 160],
    ]);
    expect(samples[0]?.t).toBe(80);
    expect(samples).toHaveLength(3);
  });

  it("is signed per axis", () => {
    const v = getWindowedVelocity(
      record([
        [100, 50, 0],
        [40, 90, 60],
      ]),
      60,
    );
    expect(v.x).toBeCloseTo(-1, 5);
    expect(v.y).toBeCloseTo(40 / 60, 5);
  });
});
