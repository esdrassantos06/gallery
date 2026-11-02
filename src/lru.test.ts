import { describe, expect, it } from "vitest";
import { remember } from "./lru";

describe("remember", () => {
  it("adds entries up to the limit and drops the oldest past it", () => {
    let map: Record<string, number> = {};
    for (const key of ["a", "b", "c", "d"]) map = remember(map, key, 1, 3);
    expect(Object.keys(map)).toEqual(["b", "c", "d"]);
  });

  it("refreshes a key it already has so it is evicted last", () => {
    let map: Record<string, number> = { a: 1, b: 1, c: 1 };
    map = remember(map, "a", 2, 3);
    map = remember(map, "d", 1, 3);
    expect(map).toEqual({ c: 1, a: 2, d: 1 });
  });

  it("never mutates the map it gets", () => {
    const map = { a: 1 };
    remember(map, "b", 2, 1);
    expect(map).toEqual({ a: 1 });
  });
});
