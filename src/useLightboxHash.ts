import { useCallback, useSyncExternalStore } from "react";

/** Options of {@link useLightboxHash}. */
export interface LightboxHashOptions {
  /** Number of slides. Hashes past it are ignored instead of opening an empty slide. */
  count?: number | undefined;
}

const CHANGE = "eg:hashchange";
const MARKER = "egLightboxHash";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

const readHash = () => window.location.hash;
const serverHash = () => "";

function parse(hash: string, prefix: string, count: number | undefined): number {
  const match = new RegExp(`^#${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-(\\d+)$`).exec(hash);
  const n = match ? Number(match[1]) : 0;
  if (n < 1 || (count !== undefined && n > count)) return -1;
  return n - 1;
}

function urlWith(hash: string): string {
  const { pathname, search } = window.location;
  return `${pathname}${search}${hash}`;
}

function markedBy(prefix: string): boolean {
  const state: unknown = window.history.state;
  return (
    typeof state === "object" &&
    state !== null &&
    (state as Record<string, unknown>)[MARKER] === prefix
  );
}

/**
 * Keeps the open slide in the URL hash, as `#prefix-3` (1-based), so a gallery
 * can be linked to, shared and closed with the browser's back button.
 *
 * Use the returned pair as the lightbox's state: it reads `-1` while closed.
 * Opening adds a history entry, changing slide replaces it, and closing goes
 * back to the entry that was there before. Hashes that do not match `prefix`
 * are left alone. On the server, and during hydration, it reads `-1`.
 *
 * @example
 * ```tsx
 * const [index, setIndex] = useLightboxHash("galeria", { count: slides.length });
 * <Lightbox
 *   slides={slides}
 *   open={index >= 0}
 *   index={Math.max(index, 0)}
 *   onIndexChange={setIndex}
 *   onClose={() => setIndex(-1)}
 * />
 * ```
 */
export function useLightboxHash(
  prefix: string,
  options: LightboxHashOptions = {},
): [index: number, setIndex: (index: number) => void] {
  const hash = useSyncExternalStore(subscribe, readHash, serverHash);
  const { count } = options;
  const index = parse(hash, prefix, count);

  const setIndex = useCallback(
    (next: number) => {
      const current = parse(window.location.hash, prefix, count);
      if (next === current) return;
      if (next < 0) {
        if (markedBy(prefix)) {
          window.history.back();
          return;
        }
        window.history.replaceState(window.history.state, "", urlWith(""));
      } else if (current < 0) {
        window.history.pushState({ [MARKER]: prefix }, "", urlWith(`#${prefix}-${next + 1}`));
      } else {
        window.history.replaceState(window.history.state, "", urlWith(`#${prefix}-${next + 1}`));
      }
      window.dispatchEvent(new Event(CHANGE));
    },
    [prefix, count],
  );

  return [index, setIndex];
}
