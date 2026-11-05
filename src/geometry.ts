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

/** How `getCrop` trims the media, and the screen offset to add to the flight's translate. */
export interface Crop {
  clipPath: string;
  x: number;
  y: number;
}

const EDGES: Record<string, number | undefined> = {
  left: 0,
  top: 0,
  center: 0.5,
  right: 1,
  bottom: 1,
};

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

function resolveOffset(token: string, overflow: number): number {
  const edge = EDGES[token];
  if (edge !== undefined) return edge;
  const match = /^(-?[\d.]+)(%|px)?$/.exec(token);
  if (!match) return 0.5;
  const amount = Number(match[1]);
  if (match[2] === "%") return clamp01(amount / 100);
  if ((match[2] === "px" || amount === 0) && overflow > 0) return clamp01(-amount / overflow);
  return 0.5;
}

/** Reads `object-position` as a 0 to 1 fraction of the overflow on each axis. */
function parsePosition(value: string, overflow: Size): { x: number; y: number } {
  const tokens = value.trim().toLowerCase().split(/\s+/);
  if (tokens.length > 2) return { x: 0.5, y: 0.5 };
  let [first = "center", second = "center"] = tokens;
  const vertical = /^(top|bottom)$/;
  if (tokens.length === 1 && vertical.test(first)) [first, second] = ["center", first];
  else if (vertical.test(first) || /^(left|right)$/.test(second)) [first, second] = [second, first];
  return { x: resolveOffset(first, overflow.width), y: resolveOffset(second, overflow.height) };
}

/**
 * Crop that trims `media`, scaled by `scale`, down to what an `object-fit: cover`
 * `window` shows at `position` (its computed `object-position`), so a flight from
 * a cropped thumbnail starts on the same pixels. Both sizes are along the media's
 * own axes. `radius` is the window's corner radius in screen pixels.
 */
export function getCrop(
  media: Size,
  window: Size,
  scale: number,
  radius = 0,
  position = "50% 50%",
): Crop {
  const spareX = Math.max(media.width - window.width / scale, 0);
  const spareY = Math.max(media.height - window.height / scale, 0);
  const at = parsePosition(position, { width: spareX * scale, height: spareY * scale });
  const [top, right, bottom, left] = [
    spareY * at.y,
    spareX * (1 - at.x),
    spareY * (1 - at.y),
    spareX * at.x,
  ];
  const sides =
    top === bottom && left === right
      ? `${top}px ${left}px`
      : `${top}px ${right}px ${bottom}px ${left}px`;
  return {
    clipPath: radius > 0 ? `inset(${sides} round ${radius / scale}px)` : `inset(${sides})`,
    x: (0.5 - at.x) * spareX * scale,
    y: (0.5 - at.y) * spareY * scale,
  };
}

/**
 * Corner radius in pixels from a computed `border-*-radius` value, resolving a
 * percentage against `width`. An elliptical corner gives its horizontal radius.
 */
export function parseRadius(value: string, width: number): number {
  const first = value.trim().split(/\s+/)[0] ?? "";
  const amount = parseFloat(first);
  if (!(amount > 0)) return 0;
  return first.endsWith("%") ? (amount * width) / 100 : amount;
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
