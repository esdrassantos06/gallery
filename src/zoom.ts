/** A 2D point or offset in CSS pixels. */
export interface Point {
  x: number;
  y: number;
}

/** Fraction of the overshoot kept when a pinch goes below the minimum scale. */
const PINCH_UNDER_FRICTION = 0.15;

/** Fraction of the overshoot kept when a pinch goes past the maximum scale. */
const PINCH_OVER_FRICTION = 0.05;

/** Keeps `scale` within `[min, max]`. */
export function clampScale(scale: number, min: number, max: number): number {
  return Math.min(Math.max(scale, min), max);
}

/**
 * Pan that keeps `point` still on screen while the scale goes from `prevScale`
 * to `nextScale`. Points and pans are relative to the image's resting center.
 */
export function getPointZoomPan(
  point: Point,
  prevPan: Point,
  prevScale: number,
  nextScale: number,
): Point {
  const ratio = nextScale / prevScale;
  return {
    x: point.x - (point.x - prevPan.x) * ratio,
    y: point.y - (point.y - prevPan.y) * ratio,
  };
}

/**
 * Pan during a pinch: the image point that started between the fingers stays
 * between them, wherever their midpoint moves.
 */
export function getPinchPan(
  mid: Point,
  startMid: Point,
  startPan: Point,
  startScale: number,
  scale: number,
): Point {
  const projected = getPointZoomPan(startMid, startPan, startScale, scale);
  return { x: projected.x + mid.x - startMid.x, y: projected.y + mid.y - startMid.y };
}

/** Distance between two pointers. */
export function getPointerDistance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Scale while pinching: proportional to the finger distance, with friction
 * instead of a hard stop past either limit. The release then settles inside.
 * With `free` set, going under the minimum follows the fingers, as the cue for
 * pinch to close.
 */
export function getPinchScale(
  startDistance: number,
  distance: number,
  startScale: number,
  min: number,
  max: number,
  free: boolean = false,
): number {
  if (startDistance <= 0) return startScale;
  const scale = (distance / startDistance) * startScale;
  if (scale < min && !free) return min + (scale - min) * PINCH_UNDER_FRICTION;
  if (scale > max) return max + (scale - max) * PINCH_OVER_FRICTION;
  return scale;
}

/**
 * Clamps the pan on one axis so a zoomed image always covers the stage on that
 * axis. An image that fits does not pan. `offset` is how far the image's resting
 * center sits from the stage center, for stages with uneven padding.
 */
export function clampPanAxis(pan: number, size: number, stage: number, offset: number): number {
  if (size <= stage) return 0;
  const reach = (size - stage) / 2;
  return Math.min(Math.max(pan, -reach - offset), reach - offset);
}

/**
 * Scale factor for one wheel event. Wheel up zooms in. Trackpad pinches arrive
 * as wheel events with `ctrlKey` and get more sensitivity; line deltas are
 * converted to pixels.
 */
export function getWheelFactor(deltaY: number, deltaMode: number, ctrlKey: boolean): number {
  const pixels = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 400 : deltaY;
  return Math.exp(-pixels * (ctrlKey ? 0.01 : 0.002));
}

/** Share of the minimum scale a pinch must release under to close, so resting fingers never do. */
const PINCH_CLOSE_RATIO = 0.9;

/**
 * Whether a released pinch closes the lightbox: it ended well under the
 * minimum scale and never went past fit on the way, so an over-then-under
 * pinch is read as a zoom correction.
 */
export function shouldCloseOnPinch(scale: number, peak: number, minScale: number): boolean {
  return peak <= 1 && scale < Math.min(minScale, 1) * PINCH_CLOSE_RATIO;
}
