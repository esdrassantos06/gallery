import { useCallback, useSyncExternalStore } from "react";

/** Options of {@link useLightboxHash}. */
export interface LightboxHashOptions {
  /** Number of slides. Hashes past it are ignored instead of opening an empty slide. */
  count?: number | undefined;
  /**
   * A unique name per slide, in slide order, written to the URL instead of the
   * number, as `#prefix-harbour`. Numbered links still open, so links shared
   * before you added names keep working. Sets `count` to `names.length`.
   */
  names?: readonly string[] | undefined;
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

function decode(part: string): string | undefined {
  try {
    return decodeURIComponent(part);
  } catch {
    return undefined;
  }
}

function parse(
  hash: string,
  prefix: string,
  count: number | undefined,
  names: readonly string[] | undefined,
): number {
  const head = `#${prefix}-`;
  if (!hash.startsWith(head)) return -1;
  const part = hash.slice(head.length);
  if (names) {
    const name = decode(part);
    const named = name === undefined ? -1 : names.indexOf(name);
    if (named >= 0) return named;
  }
  const n = /^\d+$/.test(part) ? Number(part) : 0;
  const total = names?.length ?? count;
  if (n < 1 || (total !== undefined && n > total)) return -1;
  return n - 1;
}

function hashOf(prefix: string, index: number, names: readonly string[] | undefined): string {
  const name = names?.[index];
  return `#${prefix}-${name === undefined ? index + 1 : encodeURIComponent(name)}`;
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
 * Keeps the open slide in the URL hash, as `#prefix-3` (1-based) or, with
 * `names`, `#prefix-harbour`, so a gallery can be linked to, shared and closed
 * with the browser's back button.
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
  const { count, names } = options;
  const index = parse(hash, prefix, count, names);

  const setIndex = useCallback(
    (next: number) => {
      const current = parse(window.location.hash, prefix, count, names);
      if (next === current) return;
      if (next < 0) {
        if (markedBy(prefix)) {
          window.history.back();
          return;
        }
        window.history.replaceState(window.history.state, "", urlWith(""));
      } else if (current < 0) {
        window.history.pushState({ [MARKER]: prefix }, "", urlWith(hashOf(prefix, next, names)));
      } else {
        window.history.replaceState(window.history.state, "", urlWith(hashOf(prefix, next, names)));
      }
      window.dispatchEvent(new Event(CHANGE));
    },
    [prefix, count, names],
  );

  return [index, setIndex];
}
