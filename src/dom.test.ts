import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_EASING,
  getFocusable,
  lockScroll,
  parseDuration,
  readDuration,
  readEasing,
} from "./dom";

describe("lockScroll", () => {
  afterEach(() => vi.restoreAllMocks());

  it("hides overflow and restores the exact previous inline values", () => {
    document.body.style.overflow = "scroll";
    document.body.style.paddingRight = "3px";
    const restore = lockScroll();
    expect(document.body.style.overflow).toBe("hidden");
    restore();
    expect(document.body.style.overflow).toBe("scroll");
    expect(document.body.style.paddingRight).toBe("3px");
  });

  it("pads the body by the scrollbar width so the page does not shift", () => {
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(1024);
    vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1009);
    const restore = lockScroll();
    expect(document.body.style.paddingRight).toBe("15px");
    restore();
    expect(document.body.style.paddingRight).toBe("");
  });

  it("adds the scrollbar width to the padding the body already has", () => {
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(1024);
    vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1009);
    document.body.style.paddingRight = "10px";
    const restore = lockScroll();
    expect(document.body.style.paddingRight).toBe("25px");
    restore();
    expect(document.body.style.paddingRight).toBe("10px");
  });

  it("leaves padding alone without a scrollbar", () => {
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(1024);
    vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1024);
    const restore = lockScroll();
    expect(document.body.style.paddingRight).toBe("");
    restore();
  });
});

describe("parseDuration", () => {
  it("reads milliseconds and seconds", () => {
    expect(parseDuration("300ms", 0)).toBe(300);
    expect(parseDuration(" 0.25s ", 0)).toBe(250);
    expect(parseDuration("0", 100)).toBe(0);
  });

  it("falls back on empty or invalid values", () => {
    expect(parseDuration("", 320)).toBe(320);
    expect(parseDuration("fast", 320)).toBe(320);
  });
});

describe("readDuration", () => {
  afterEach(() => {
    Reflect.deleteProperty(window, "matchMedia");
    document.body.removeAttribute("style");
  });

  it("reads --eg-duration from the element", () => {
    document.body.style.setProperty("--eg-duration", "250ms");
    expect(readDuration(document.body)).toBe(250);
  });

  it("is zero when the user prefers reduced motion", () => {
    document.body.style.setProperty("--eg-duration", "250ms");
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    expect(readDuration(document.body)).toBe(0);
  });
});

describe("getFocusable", () => {
  it("lists enabled, tabbable controls in DOM order", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <button>a</button>
      <button disabled>b</button>
      <a href="#x">c</a>
      <div tabindex="-1">d</div>
      <div tabindex="0">e</div>
      <button hidden>f</button>`;
    document.body.append(root);
    expect(getFocusable(root).map((el) => el.textContent)).toEqual(["a", "c", "e"]);
    root.remove();
  });
});

describe("readEasing", () => {
  afterEach(() => document.body.removeAttribute("style"));

  it("reads --eg-easing and falls back to the default curve", () => {
    expect(readEasing(document.body)).toBe(DEFAULT_EASING);
    document.body.style.setProperty("--eg-easing", " ease-in ");
    expect(readEasing(document.body)).toBe("ease-in");
  });
});
