/**
 * Copy of `map` with `key` set to `value` as its newest entry, keeping at most
 * `limit` entries by dropping the least recently set ones. Keys must not look
 * like array indices, which objects keep in numeric order; URLs never do.
 */
export function remember<T>(
  map: Readonly<Record<string, T>>,
  key: string,
  value: T,
  limit: number,
): Record<string, T> {
  const entries = Object.entries(map).filter(([name]) => name !== key);
  entries.push([key, value]);
  return Object.fromEntries(entries.slice(-limit));
}
