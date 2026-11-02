/** A width and height pair in CSS pixels. */
export interface Size {
  width: number;
  height: number;
}

/**
 * Fits a natural size inside a box keeping its aspect ratio, never upscaling.
 * Returns the box itself when the natural size is unknown.
 */
export function fitContain(width: number, height: number, boxW: number, boxH: number): Size {
  if (!width || !height) return { width: boxW, height: boxH };
  const scale = Math.min(boxW / width, boxH / height, 1);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** Wraps an index into `[0, total)`. */
export function wrapIndex(index: number, total: number): number {
  return ((index % total) + total) % total;
}

/**
 * Signed distance from `current` to `index`. With `loop` it takes the shortest
 * way round, so the first slide sits right after the last one.
 */
export function relativeOffset(
  index: number,
  current: number,
  total: number,
  loop: boolean,
): number {
  const diff = index - current;
  if (!loop) return diff;
  const wrapped = wrapIndex(diff, total);
  return wrapped > total / 2 ? wrapped - total : wrapped;
}

/** A box in viewport coordinates, as returned by `getBoundingClientRect`. */
export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Translation and uniform scale that place one box over another. */
export interface FlipTransform {
  x: number;
  y: number;
  scale: number;
}

/**
 * Transform that moves `to` onto `from`: the centers line up and the uniform
 * scale is the smallest one that covers `from` completely.
 */
export function getFlipTransform(from: Rect, to: Rect): FlipTransform {
  return {
    x: from.left + from.width / 2 - (to.left + to.width / 2),
    y: from.top + from.height / 2 - (to.top + to.height / 2),
    scale: Math.max(from.width / to.width, from.height / to.height),
  };
}

/** One mounted slide and its position relative to the current one. */
export interface WindowSlide {
  index: number;
  offset: number;
}

/**
 * Slides within `preload` of `current`, each mounted once, sorted by index so
 * their DOM order stays stable while the user navigates.
 */
export function getSlideWindow(
  current: number,
  total: number,
  preload: number,
  loop: boolean,
): WindowSlide[] {
  const slides = new Map<number, number>();
  for (let step = -preload; step <= preload; step++) {
    const raw = current + step;
    if (!loop && (raw < 0 || raw >= total)) continue;
    if (total === 0) break;
    const index = wrapIndex(raw, total);
    if (!slides.has(index)) slides.set(index, relativeOffset(index, current, total, loop));
  }
  return [...slides]
    .map(([index, offset]) => ({ index, offset }))
    .sort((a, b) => a.index - b.index);
}

/** Mirroring of the media along its own axes: 1 as is, -1 mirrored. */
export interface Flip {
  x: 1 | -1;
  y: 1 | -1;
}

/**
 * Mirrors the media across the screen axis the user asked for. On quarter
 * turns the image's own axes are swapped on screen, so the other one flips.
 */
export function flipMedia(flip: Flip, rotation: number, axis: "horizontal" | "vertical"): Flip {
  const sideways = Math.abs(rotation % 180) === 90;
  const own = (axis === "horizontal") !== sideways ? "x" : "y";
  return { ...flip, [own]: -flip[own] as 1 | -1 };
}

/** CSS transform for a rotation in degrees and a flip, or an empty string at rest. */
export function getMediaTransform(rotation: number, flip: Flip): string {
  const turn = rotation ? `rotate(${rotation}deg)` : "";
  const mirror = flip.x !== 1 || flip.y !== 1 ? `scale(${flip.x}, ${flip.y})` : "";
  return [turn, mirror].filter(Boolean).join(" ");
}
