import { describe, expect, it } from "vitest";
import { getToolbarOverflow, TOOLBAR_PRIORITY } from "./toolbar";

const item = (priority: number, width = 50) => ({ width, priority });

describe("TOOLBAR_PRIORITY", () => {
  it("lets gesture duplicates go first and keeps actions longest", () => {
    expect(TOOLBAR_PRIORITY.zoomIn).toBeLessThan(TOOLBAR_PRIORITY.rotateLeft);
    expect(TOOLBAR_PRIORITY.flipHorizontal).toBeLessThan(TOOLBAR_PRIORITY.fullscreen);
    expect(TOOLBAR_PRIORITY.fullscreen).toBeLessThan(TOOLBAR_PRIORITY.share);
    expect(TOOLBAR_PRIORITY.download).toBe(TOOLBAR_PRIORITY.slideshow);
  });
});

describe("getToolbarOverflow", () => {
  it("moves nothing when every button fits beside the counter", () => {
    expect(
      getToolbarOverflow({
        available: 400,
        reserved: 80,
        moreWidth: 50,
        items: [item(30), item(10), item(0)],
      }),
    ).toEqual([]);
  });

  it("moves nothing before the toolbar has been laid out", () => {
    expect(
      getToolbarOverflow({ available: 0, reserved: 0, moreWidth: 50, items: [item(10)] }),
    ).toEqual([]);
  });

  it("moves the lowest priority first and pays for the More button", () => {
    const items = [item(30), item(10), item(0), item(10), item(0)];
    expect(getToolbarOverflow({ available: 300, reserved: 80, moreWidth: 50, items })).toEqual([
      2, 4,
    ]);
  });

  it("moves the button later in DOM order first among equals", () => {
    const items = [item(10), item(10), item(10), item(10), item(10)];
    expect(getToolbarOverflow({ available: 200, reserved: 0, moreWidth: 50, items })).toEqual([
      3, 4,
    ]);
  });

  it("can move every button when nothing fits", () => {
    expect(
      getToolbarOverflow({
        available: 100,
        reserved: 80,
        moreWidth: 20,
        items: [item(30), item(0)],
      }),
    ).toEqual([0, 1]);
  });
});
