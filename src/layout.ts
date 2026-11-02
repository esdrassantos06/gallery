/**
 * Pure layout math for the grids. Callers measure the container, pass aspect
 * ratios and position items from the returned boxes.
 *
 * The justified layout is adapted from opengallery's `justified-layout.ts`,
 * MIT License, Copyright (c) 2026 opengallery contributors.
 */

/** Position and size of one item, in px. */
export interface GridBox {
  top: number;
  /** Offset from the inline start edge: `left` in left-to-right layouts, `right` in right-to-left ones. */
  start: number;
  width: number;
  height: number;
}

/** Boxes in item order plus the total height. */
export interface GridLayout {
  /** One box per ratio. Items hidden by `lastRow: "hide"` get a zero-size box. */
  boxes: GridBox[];
  /** Height of the content in px. */
  height: number;
}

/** Options of {@link getJustifiedLayout}. */
export interface JustifiedLayoutOptions {
  /** Aspect ratios (width / height) in item order. */
  ratios: readonly number[];
  /** Width available for rows, in px. */
  containerWidth: number;
  /** Row height to aim for, in px. */
  targetRowHeight: number;
  /** Space between items and between rows, in px. */
  gap: number;
  /**
   * What to do with the leftover items that cannot fill a row: keep them at the
   * target height (`start`), stretch them like the other rows (`justify`) or drop them (`hide`).
   * @defaultValue "start"
   */
  lastRow?: "start" | "justify" | "hide" | undefined;
  /**
   * Tallest a row may get, as a multiple of `targetRowHeight`. Clamped rows do not fill the width.
   * @defaultValue 1.75
   */
  maxScale?: number | undefined;
}

/** Options of {@link getMasonryLayout}. */
export interface MasonryLayoutOptions {
  /** Aspect ratios (width / height) in item order. */
  ratios: readonly number[];
  /** Width available for the columns, in px. */
  containerWidth: number;
  /** Number of columns. At least one is used. */
  columns: number;
  /** Space between columns and between items, in px. */
  gap: number;
}

const ratioOf = (ratio: number): number => (Number.isFinite(ratio) && ratio > 0 ? ratio : 1);

/**
 * Rows of equal height that fill the container edge to edge, each row as close
 * as possible to `targetRowHeight`.
 */
export function getJustifiedLayout(options: JustifiedLayoutOptions): GridLayout {
  const { containerWidth, targetRowHeight, gap, lastRow = "start", maxScale = 1.75 } = options;
  const ratios = options.ratios.map(ratioOf);
  const boxes: GridBox[] = new Array(ratios.length);
  const maxHeight = targetRowHeight * maxScale;

  const fillHeight = (row: readonly number[]): number =>
    (containerWidth - gap * (row.length - 1)) / row.reduce((sum, ratio) => sum + ratio, 0);

  let top = 0;
  let row: number[] = [];
  let first = 0;

  const closeRow = (wanted: number, fill: boolean): void => {
    const height = Math.round(Math.min(wanted, maxHeight));
    const stretch = fill && wanted <= maxHeight;
    let start = 0;
    row.forEach((ratio, offset) => {
      // Rounding drift lands on the last item so the row fills the width exactly.
      const width =
        stretch && offset === row.length - 1 ? containerWidth - start : Math.round(ratio * height);
      boxes[first + offset] = { top, start, width, height };
      start += width + gap;
    });
    top += height + gap;
    first += row.length;
    row = [];
  };

  for (const ratio of ratios) {
    row.push(ratio);
    const height = fillHeight(row);
    if (height > targetRowHeight) continue;
    const without = row.length > 1 ? fillHeight(row.slice(0, -1)) : null;
    if (without !== null && without - targetRowHeight < targetRowHeight - height) {
      const carried = row.pop() as number;
      closeRow(without, true);
      row = [carried];
      if (fillHeight(row) <= targetRowHeight) closeRow(fillHeight(row), true);
    } else {
      closeRow(height, true);
    }
  }

  if (row.length > 0) {
    if (lastRow === "hide") {
      for (let i = first; i < ratios.length; i++) {
        boxes[i] = { top: 0, start: 0, width: 0, height: 0 };
      }
    } else {
      closeRow(lastRow === "justify" ? fillHeight(row) : targetRowHeight, lastRow === "justify");
    }
  }

  return { boxes, height: Math.max(top - gap, 0) };
}

/**
 * Equal-width columns. Each item goes into the shortest column, so items keep
 * a left-to-right, top-to-bottom reading order that matches the DOM order.
 */
export function getMasonryLayout(options: MasonryLayoutOptions): GridLayout {
  const { containerWidth, gap } = options;
  const columns = Math.max(1, Math.floor(options.columns) || 1);
  const columnWidth = (containerWidth - gap * (columns - 1)) / columns;
  const heights: number[] = new Array(columns).fill(0);
  const boxes = options.ratios.map((ratio) => {
    const column = heights.indexOf(Math.min(...heights));
    const height = Math.round(columnWidth / ratioOf(ratio));
    const box = {
      top: heights[column] as number,
      start: Math.round(column * (columnWidth + gap)),
      width: Math.round(columnWidth),
      height,
    };
    heights[column] = box.top + height + gap;
    return box;
  });
  return { boxes, height: boxes.length ? Math.max(...heights) - gap : 0 };
}
