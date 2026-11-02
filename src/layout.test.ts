import { describe, expect, it } from "vitest";
import { getJustifiedLayout, getMasonryLayout, type GridLayout } from "./layout";

/** Groups boxes into rows by their top offset, zero-size boxes excluded. */
function rowsOf(layout: GridLayout): number[][] {
  const rows = new Map<number, number[]>();
  layout.boxes.forEach((box, index) => {
    if (box.width === 0 && box.height === 0) return;
    const row = rows.get(box.top) ?? [];
    row.push(index);
    rows.set(box.top, row);
  });
  return [...rows.entries()].sort(([a], [b]) => a - b).map(([, indexes]) => indexes);
}

function rowWidth(layout: GridLayout, row: number[], gap: number): number {
  return row.reduce((sum, index) => sum + layout.boxes[index]!.width, 0) + gap * (row.length - 1);
}

describe("getJustifiedLayout", () => {
  const BASE = { containerWidth: 1000, targetRowHeight: 200, gap: 10, maxScale: 1.75 } as const;

  it("fills every closed row to the exact container width", () => {
    const layout = getJustifiedLayout({
      ...BASE,
      lastRow: "justify",
      ratios: [1.5, 0.8, 1.33, 1, 2.2, 0.66, 1.5, 1.78, 1, 1.2],
    });
    for (const row of rowsOf(layout)) expect(rowWidth(layout, row, BASE.gap)).toBe(1000);
  });

  it("preserves item order left to right, top to bottom", () => {
    const layout = getJustifiedLayout({ ...BASE, ratios: [1.5, 0.8, 1.33, 1, 2.2, 0.66, 1.5] });
    expect(rowsOf(layout).flat()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    for (const row of rowsOf(layout)) {
      const starts = row.map((i) => layout.boxes[i]!.start);
      expect([...starts].sort((a, b) => a - b)).toEqual(starts);
    }
  });

  it("keeps the leftover row at target height, start-aligned, by default", () => {
    const layout = getJustifiedLayout({ ...BASE, ratios: [1.5, 1.5, 1.5, 1] });
    const rows = rowsOf(layout);
    expect(rows[rows.length - 1]).toEqual([3]);
    expect(layout.boxes[3]).toEqual({ top: expect.any(Number), start: 0, width: 200, height: 200 });
  });

  it("justifies the leftover row when asked, clamped by maxScale", () => {
    const layout = getJustifiedLayout({ ...BASE, lastRow: "justify", ratios: [1.5, 1.5, 1.5, 1] });
    expect(layout.boxes[3]!.height).toBe(200 * 1.75);
    expect(layout.boxes[3]!.width).toBe(Math.round(200 * 1.75));
  });

  it("zero-sizes the leftover items under lastRow: hide", () => {
    const layout = getJustifiedLayout({ ...BASE, lastRow: "hide", ratios: [1.5, 1.5, 1.5, 1] });
    expect(layout.boxes).toHaveLength(4);
    expect(layout.boxes[3]).toEqual({ top: 0, start: 0, width: 0, height: 0 });
    const visibleBottom = Math.max(
      ...rowsOf(layout)
        .flat()
        .map((i) => layout.boxes[i]!.top + layout.boxes[i]!.height),
    );
    expect(layout.height).toBe(visibleBottom);
  });

  it("breaks rows at the height closest to the target", () => {
    expect(rowsOf(getJustifiedLayout({ ...BASE, ratios: [2, 2, 2, 2] }))[0]).toEqual([0, 1, 2]);
    expect(rowsOf(getJustifiedLayout({ ...BASE, ratios: [4, 3.2, 4, 4] }))[0]).toEqual([0]);
  });

  it("treats invalid ratios as square", () => {
    const layout = getJustifiedLayout({
      ...BASE,
      lastRow: "justify",
      ratios: [1, Number.NaN, -2, 0, 1],
    });
    expect(layout.boxes).toHaveLength(5);
    for (const row of rowsOf(layout)) expect(rowWidth(layout, row, BASE.gap)).toBe(1000);
  });

  it("handles empty input and single items", () => {
    expect(getJustifiedLayout({ ...BASE, ratios: [] })).toEqual({ boxes: [], height: 0 });
    const single = getJustifiedLayout({ ...BASE, ratios: [2] });
    expect(single.boxes[0]).toMatchObject({ top: 0, start: 0, height: 200 });
    expect(single.height).toBe(200);
  });

  it("closes a panorama wider than the container as its own row", () => {
    const layout = getJustifiedLayout({ ...BASE, ratios: [8, 1, 1, 1, 1, 1.2] });
    expect(rowsOf(layout)[0]).toEqual([0]);
    expect(layout.boxes[0]!.width).toBe(1000);
    expect(layout.boxes[0]!.height).toBe(Math.round(1000 / 8));
  });

  it("holds the fill invariant across many ratio mixes", () => {
    let seed = 42;
    const next = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let run = 0; run < 25; run++) {
      const count = 3 + Math.floor(next() * 20);
      const ratios = Array.from({ length: count }, () => 0.4 + next() * 2.4);
      const layout = getJustifiedLayout({ ...BASE, lastRow: "justify", ratios });
      const rows = rowsOf(layout);
      expect(rows.flat()).toEqual(ratios.map((_, i) => i));
      for (const row of rows) {
        const height = layout.boxes[row[0]!]!.height;
        if (height <= BASE.targetRowHeight * BASE.maxScale - 1) {
          expect(rowWidth(layout, row, BASE.gap)).toBe(1000);
        }
        for (const index of row) expect(layout.boxes[index]!.height).toBe(height);
      }
    }
  });
});

describe("getMasonryLayout", () => {
  it("places each item in the shortest column, first column on ties", () => {
    const layout = getMasonryLayout({
      containerWidth: 320,
      columns: 3,
      gap: 10,
      ratios: [1, 0.5, 1, 2, 1],
    });
    expect(layout.boxes.map((b) => b.start)).toEqual([0, 110, 220, 0, 220]);
    expect(layout.boxes.map((b) => b.top)).toEqual([0, 0, 0, 110, 110]);
    expect(layout.boxes[1]).toEqual({ top: 0, start: 110, width: 100, height: 200 });
    expect(layout.boxes[3]!.height).toBe(50);
    expect(layout.height).toBe(210);
  });

  it("keeps reading order: the first row of items goes left to right", () => {
    const layout = getMasonryLayout({
      containerWidth: 1000,
      columns: 4,
      gap: 8,
      ratios: [1.5, 0.7, 1, 1.2, 0.8],
    });
    const firstRow = layout.boxes.slice(0, 4).map((b) => b.start);
    expect([...firstRow].sort((a, b) => a - b)).toEqual(firstRow);
    expect(layout.boxes.slice(0, 4).every((b) => b.top === 0)).toBe(true);
  });

  it("uses at least one column and treats invalid ratios as square", () => {
    const layout = getMasonryLayout({ containerWidth: 300, columns: 0, gap: 4, ratios: [0, 1] });
    expect(layout.boxes).toEqual([
      { top: 0, start: 0, width: 300, height: 300 },
      { top: 304, start: 0, width: 300, height: 300 },
    ]);
    expect(layout.height).toBe(604);
  });

  it("returns an empty layout for no items", () => {
    expect(getMasonryLayout({ containerWidth: 500, columns: 3, gap: 8, ratios: [] })).toEqual({
      boxes: [],
      height: 0,
    });
  });
});
