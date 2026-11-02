const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Controls inside `root` that Tab can reach, in DOM order. */
export function getFocusable(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.closest("[hidden], [inert]"),
  );
}

/**
 * Stops the page from scrolling and pads the body by the scrollbar width so
 * nothing shifts sideways. Returns a function that restores the exact inline
 * values that were there before.
 */
export function lockScroll(): () => void {
  const { body, documentElement } = document;
  const overflow = body.style.overflow;
  const paddingRight = body.style.paddingRight;
  const scrollbar = window.innerWidth - documentElement.clientWidth;
  if (scrollbar > 0) {
    const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${current + scrollbar}px`;
  }
  body.style.overflow = "hidden";
  return () => {
    body.style.overflow = overflow;
    body.style.paddingRight = paddingRight;
  };
}

/** Parses a CSS time such as `300ms` or `0.3s` into milliseconds. */
export function parseDuration(value: string, fallback: number): number {
  const match = /^(-?[\d.]+)(ms|s)?$/.exec(value.trim());
  if (!match) return fallback;
  const amount = Number(match[1]);
  if (Number.isNaN(amount)) return fallback;
  return match[2] === "s" ? amount * 1000 : amount;
}

/** Default length of the open, close and slide animations in ms. */
export const DEFAULT_DURATION = 320;

/** Animation length for `el`: its `--eg-duration`, or zero under reduced motion. */
export function readDuration(el: Element): number {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return 0;
  return parseDuration(
    window.getComputedStyle(el).getPropertyValue("--eg-duration"),
    DEFAULT_DURATION,
  );
}

/** Default timing function of the open, close and slide animations. */
export const DEFAULT_EASING = "cubic-bezier(0.2, 0, 0, 1)";

/** Timing function for `el`: its `--eg-easing`, or {@link DEFAULT_EASING}. */
export function readEasing(el: Element): string {
  return window.getComputedStyle(el).getPropertyValue("--eg-easing").trim() || DEFAULT_EASING;
}
