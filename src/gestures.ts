/** Axis a drag follows once it has moved far enough. */
export type SwipeAxis = "horizontal" | "vertical";

/** Where a horizontal release sends the gallery. */
export type SwipeReleaseVerdict = "next" | "prev" | "stay";

/** Travel in px before a drag commits to an axis. */
const SWIPE_AXIS_THRESHOLD = 10;

/** Release speed in px/ms that navigates even below the distance threshold. */
const FLICK_VELOCITY = 0.5;

/** Shortest travel in px that can count as a flick, so taps never navigate. */
const FLICK_MIN_DISTANCE = 20;

/** Fraction of the finger travel kept when dragging past the first or last slide. */
const SLIDE_EDGE_FRICTION = 0.35;

/** Shortest vertical travel in px before a release may close. */
const VERTICAL_CLOSE_MIN_DRAG = 40;

/** Vertical travel, as a fraction of the viewport height, that closes on its own. */
const VERTICAL_CLOSE_DRAG_RATIO = 0.2;

/** Momentum-projected vertical travel, as a fraction of the viewport height, that closes. */
const VERTICAL_CLOSE_PROJECTED_RATIO = 0.4;

/** How far back in ms a release looks when reading the gesture velocity. */
const VELOCITY_WINDOW_MS = 100;

/** Per-millisecond velocity retention used to project a release. */
const DECELERATION_RATE = 0.995;

/** Distance a release keeps travelling while its velocity decays. */
function project(velocity: number, decelerationRate: number = DECELERATION_RATE): number {
  return (velocity * decelerationRate) / (1 - decelerationRate);
}

/** Picks the axis once the drag passes {@link SWIPE_AXIS_THRESHOLD}; sticky afterwards. */
export function getSwipeAxis(
  deltaX: number,
  deltaY: number,
  current: SwipeAxis | undefined,
): SwipeAxis | undefined {
  if (current) return current;
  if (Math.abs(deltaX) > SWIPE_AXIS_THRESHOLD) return "horizontal";
  if (Math.abs(deltaY) > SWIPE_AXIS_THRESHOLD) return "vertical";
  return undefined;
}

/** Horizontal drag with rubber-banding toward a side that has no slide. */
export function getEdgeFrictionedDelta(deltaX: number, hasPrev: boolean, hasNext: boolean): number {
  if ((deltaX > 0 && !hasPrev) || (deltaX < 0 && !hasNext)) return deltaX * SLIDE_EDGE_FRICTION;
  return deltaX;
}

/** Input of {@link getSwipeReleaseVerdict}. */
export interface SwipeReleaseInput {
  deltaX: number;
  /** Release velocity in px/ms, signed. */
  velocityX: number;
  /** Distance in px that always navigates. */
  threshold: number;
  /** Release speed in px/ms that navigates below the threshold. */
  flickVelocity?: number;
  /** Slide width. A release projected past its midpoint also navigates. */
  viewportWidth?: number;
}

/**
 * Decides a horizontal release: past the threshold, a quick flick in the drag
 * direction, or momentum past the midpoint navigates. A negative delta means next.
 */
export function getSwipeReleaseVerdict({
  deltaX,
  velocityX,
  threshold,
  flickVelocity = FLICK_VELOCITY,
  viewportWidth,
}: SwipeReleaseInput): SwipeReleaseVerdict {
  const distance = Math.abs(deltaX);
  const sameWay = deltaX !== 0 && Math.sign(velocityX) === Math.sign(deltaX);
  const flicked = distance > FLICK_MIN_DISTANCE && sameWay;
  const passes =
    distance > threshold ||
    (flicked && Math.abs(velocityX) > flickVelocity) ||
    (flicked &&
      viewportWidth !== undefined &&
      Math.abs(deltaX + project(velocityX)) > viewportWidth / 2);
  if (!passes) return "stay";
  return deltaX < 0 ? "next" : "prev";
}

/**
 * Decides a vertical release. The finger must travel {@link VERTICAL_CLOSE_MIN_DRAG}
 * and the release must keep moving away from rest; then either the drag itself or
 * its momentum projection has to cover enough of the viewport.
 */
export function shouldCloseOnVerticalDrag(
  deltaY: number,
  velocityY: number,
  viewportHeight: number,
): boolean {
  if (Math.abs(deltaY) < VERTICAL_CLOSE_MIN_DRAG) return false;
  const projected = deltaY + project(velocityY);
  if (Math.sign(projected) !== Math.sign(deltaY)) return false;
  return (
    Math.abs(deltaY) > VERTICAL_CLOSE_DRAG_RATIO * viewportHeight ||
    Math.abs(projected) > VERTICAL_CLOSE_PROJECTED_RATIO * viewportHeight
  );
}

/** One pointer position at a timestamp in ms. */
export interface VelocitySample {
  x: number;
  y: number;
  t: number;
}

/** Signed velocity in px/ms per axis. */
export interface Velocity {
  x: number;
  y: number;
}

/** Appends a sample and drops those older than the window. */
export function pushVelocitySample(
  samples: readonly VelocitySample[],
  sample: VelocitySample,
  windowMs: number = VELOCITY_WINDOW_MS,
): VelocitySample[] {
  return [...samples.filter((s) => sample.t - s.t <= windowMs), sample];
}

/**
 * Velocity over the window that ends at `releaseTime`. A finger that rested
 * before lifting, sub-pixel drift and spans under 5ms all read as zero.
 */
export function getWindowedVelocity(
  samples: readonly VelocitySample[],
  releaseTime: number,
  windowMs: number = VELOCITY_WINDOW_MS,
): Velocity {
  const recent = samples.filter((s) => releaseTime - s.t <= windowMs);
  const first = recent[0];
  const last = recent.at(-1);
  if (!first || !last || recent.length < 2) return { x: 0, y: 0 };
  const dt = last.t - first.t;
  if (dt < 5) return { x: 0, y: 0 };
  const dx = last.x - first.x;
  const dy = last.y - first.y;
  return { x: Math.abs(dx) > 1 ? dx / dt : 0, y: Math.abs(dy) > 1 ? dy / dt : 0 };
}
