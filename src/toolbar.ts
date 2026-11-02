/** Toolbar buttons that can move into the overflow menu. Close never does. */
export type ToolKey =
  | "slideshow"
  | "zoomIn"
  | "zoomOut"
  | "rotateLeft"
  | "rotateRight"
  | "flipHorizontal"
  | "flipVertical"
  | "share"
  | "download"
  | "fullscreen";

/**
 * Higher stays in the row longer. Zoom goes first because pinch, double tap
 * and the wheel do the same; actions with no gesture stay longest.
 */
export const TOOLBAR_PRIORITY: Readonly<Record<ToolKey, number>> = {
  slideshow: 30,
  share: 30,
  download: 30,
  fullscreen: 20,
  rotateLeft: 10,
  rotateRight: 10,
  flipHorizontal: 10,
  flipVertical: 10,
  zoomIn: 0,
  zoomOut: 0,
};

/** One measured toolbar button. */
export interface ToolbarOverflowItem {
  /** Width in px, gap included. */
  width: number;
  /** Higher stays in the row longer. */
  priority: number;
}

/** Input of {@link getToolbarOverflow}. */
export interface ToolbarOverflowInput {
  /** Width of the top bar row in px. */
  available: number;
  /** Width in px taken by content that never moves: the counter, close and custom buttons. */
  reserved: number;
  /** Width in px of the More button. */
  moreWidth: number;
  /** The movable buttons, in DOM order. */
  items: readonly ToolbarOverflowItem[];
}

/**
 * Indices, in DOM order, of the buttons that move into the menu. Empty when
 * everything fits or nothing is laid out yet. Lowest priority moves first; among
 * equals, the one later in DOM order. The More button is paid for as soon as
 * anything moves.
 */
export function getToolbarOverflow({
  available,
  reserved,
  moreWidth,
  items,
}: ToolbarOverflowInput): number[] {
  if (available <= 0) return [];
  const total = items.reduce((sum, item) => sum + item.width, 0);
  if (reserved + total <= available) return [];
  const candidates = items
    .map((item, index) => ({ ...item, index }))
    .sort((a, b) => a.priority - b.priority || b.index - a.index);
  let used = reserved + moreWidth + total;
  const moved: number[] = [];
  for (const item of candidates) {
    if (used <= available) break;
    moved.push(item.index);
    used -= item.width;
  }
  return moved.sort((a, b) => a - b);
}
