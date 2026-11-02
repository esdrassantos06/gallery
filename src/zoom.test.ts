import { describe, expect, it } from "vitest";
import {
  clampPanAxis,
  clampScale,
  getPinchPan,
  getPinchScale,
  getPointerDistance,
  getPointZoomPan,
  getWheelFactor,
  shouldCloseOnPinch,
} from "./zoom";

describe("clampScale", () => {
  it("keeps the scale between the limits", () => {
    expect(clampScale(0.5, 1, 3)).toBe(1);
    expect(clampScale(5, 1, 3)).toBe(3);
    expect(clampScale(2, 1, 3)).toBe(2);
  });
});

describe("getPointZoomPan", () => {
  it("keeps the anchor point still while the scale changes", () => {
    expect(getPointZoomPan({ x: 100, y: 50 }, { x: 0, y: 0 }, 1, 2)).toEqual({ x: -100, y: -50 });
    expect(getPointZoomPan({ x: 100, y: 50 }, { x: -100, y: -50 }, 2, 1)).toEqual({ x: 0, y: 0 });
  });
});

describe("getPinchPan", () => {
  it("keeps the image point between the fingers as their midpoint moves", () => {
    const startMid = { x: 100, y: 50 };
    const startPan = { x: 0, y: 0 };
    expect(getPinchPan({ x: 140, y: 30 }, startMid, startPan, 1, 1)).toEqual({ x: 40, y: -20 });
    const projected = getPointZoomPan(startMid, startPan, 1, 2);
    expect(getPinchPan({ x: 130, y: 50 }, startMid, startPan, 1, 2)).toEqual({
      x: projected.x + 30,
      y: projected.y,
    });
  });
});

describe("getPinchScale", () => {
  it("follows the distance ratio", () => {
    expect(getPointerDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(getPinchScale(100, 200, 1, 1, 3)).toBe(2);
    expect(getPinchScale(0, 200, 1.5, 1, 3)).toBe(1.5);
  });

  it("resists past both limits instead of stopping dead", () => {
    expect(getPinchScale(100, 500, 1, 1, 3)).toBeCloseTo(3.1, 10);
    expect(getPinchScale(100, 10, 1, 1, 3)).toBeCloseTo(0.865, 10);
  });
});

describe("clampPanAxis", () => {
  it("does not pan an image that fits", () => {
    expect(clampPanAxis(120, 800, 1000, 0)).toBe(0);
  });

  it("lets a zoomed image move until its edge meets the stage edge", () => {
    expect(clampPanAxis(500, 1600, 1000, 0)).toBe(300);
    expect(clampPanAxis(-500, 1600, 1000, 0)).toBe(-300);
    expect(clampPanAxis(100, 1600, 1000, 0)).toBe(100);
  });

  it("accounts for an image resting off the stage center", () => {
    expect(clampPanAxis(500, 1600, 1000, -40)).toBe(340);
    expect(clampPanAxis(-500, 1600, 1000, -40)).toBe(-260);
  });
});

describe("getWheelFactor", () => {
  it("zooms in on wheel up and out on wheel down", () => {
    expect(getWheelFactor(-100, 0, false)).toBeGreaterThan(1);
    expect(getWheelFactor(100, 0, false)).toBeLessThan(1);
  });

  it("is symmetric, so in then out lands where it started", () => {
    expect(getWheelFactor(-100, 0, false) * getWheelFactor(100, 0, false)).toBeCloseTo(1, 10);
  });

  it("is more sensitive for trackpad pinches, which arrive as ctrl+wheel", () => {
    expect(getWheelFactor(-10, 0, true)).toBeGreaterThan(getWheelFactor(-10, 0, false));
  });

  it("normalises line-based deltas", () => {
    expect(getWheelFactor(-3, 1, false)).toBeCloseTo(getWheelFactor(-48, 0, false), 10);
  });
});

describe("pinch to close", () => {
  it("follows the fingers below the minimum while armed", () => {
    expect(getPinchScale(100, 50, 1, 1, 3, true)).toBe(0.5);
    expect(getPinchScale(100, 500, 1, 1, 3, true)).toBeCloseTo(3.1, 10);
  });

  it("closes only a release below the minimum after a gesture that never went past fit", () => {
    expect(shouldCloseOnPinch(0.6, 1, 1)).toBe(true);
    expect(shouldCloseOnPinch(0.6, 1.4, 1)).toBe(false);
    expect(shouldCloseOnPinch(1, 1, 1)).toBe(false);
  });

  it("ignores the small wobble of fingers resting on the glass", () => {
    expect(shouldCloseOnPinch(0.97, 1, 1)).toBe(false);
  });

  it("measures from the minimum scale when it is under fit", () => {
    expect(shouldCloseOnPinch(0.6, 1, 0.5)).toBe(false);
    expect(shouldCloseOnPinch(0.4, 1, 0.5)).toBe(true);
  });
});
