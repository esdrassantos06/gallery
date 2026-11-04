import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Lightbox, useLightboxHash } from "./index";
import { slides } from "./test/harness";

function setUrl(path: string) {
  window.history.replaceState(null, "", path);
}

const popTo = (fn: () => void) =>
  act(
    () =>
      new Promise<void>((resolve) => {
        window.addEventListener("popstate", () => resolve(), { once: true });
        fn();
      }),
  );

beforeEach(() => setUrl("/page?q=1"));
afterEach(() => setUrl("/"));

describe("useLightboxHash", () => {
  it("opens the slide named in the hash, 1-based", () => {
    setUrl("/page#galeria-3");
    const { result } = renderHook(() => useLightboxHash("galeria", { count: 12 }));
    expect(result.current[0]).toBe(2);
  });

  it("ignores other hashes, other prefixes and out-of-range slides", () => {
    for (const hash of [
      "#about",
      "#galeria",
      "#galeria-0",
      "#galeria-13",
      "#galeria-2x",
      "#fotos-2",
    ]) {
      setUrl(`/page${hash}`);
      const { result, unmount } = renderHook(() => useLightboxHash("galeria", { count: 12 }));
      expect(result.current[0]).toBe(-1);
      unmount();
    }
  });

  it("adds a history entry when opening and replaces it while navigating", () => {
    const { result } = renderHook(() => useLightboxHash("galeria"));
    const length = window.history.length;
    act(() => result.current[1](4));
    expect(window.location.hash).toBe("#galeria-5");
    expect(window.history.length).toBe(length + 1);
    expect(result.current[0]).toBe(4);
    act(() => result.current[1](5));
    expect(window.location.hash).toBe("#galeria-6");
    expect(window.history.length).toBe(length + 1);
    expect(window.location.search).toBe("?q=1");
  });

  it("closes by going back, which restores the previous URL", async () => {
    setUrl("/page?q=1#intro");
    const { result } = renderHook(() => useLightboxHash("galeria"));
    act(() => result.current[1](1));
    await popTo(() => result.current[1](-1));
    expect(result.current[0]).toBe(-1);
    expect(window.location.hash).toBe("#intro");
  });

  it("closes on the browser back button and reopens on forward", async () => {
    const { result } = renderHook(() => useLightboxHash("galeria"));
    act(() => result.current[1](2));
    await popTo(() => window.history.back());
    expect(result.current[0]).toBe(-1);
    await popTo(() => window.history.forward());
    expect(result.current[0]).toBe(2);
  });

  it("drops its own hash without leaving the page when the lightbox was opened by a deep link", () => {
    setUrl("/page?q=1#galeria-2");
    const { result } = renderHook(() => useLightboxHash("galeria"));
    const length = window.history.length;
    act(() => result.current[1](-1));
    expect(result.current[0]).toBe(-1);
    expect(window.location.hash).toBe("");
    expect(window.location.search).toBe("?q=1");
    expect(window.history.length).toBe(length);
  });

  describe("with names", () => {
    const names = ["harbour", "old town", "beach"];

    it("writes the slide's name instead of its number", () => {
      const { result } = renderHook(() => useLightboxHash("galeria", { names }));
      act(() => result.current[1](1));
      expect(window.location.hash).toBe("#galeria-old%20town");
      expect(result.current[0]).toBe(1);
    });

    it("opens the slide whose name is in the hash", () => {
      setUrl("/page#galeria-beach");
      const { result } = renderHook(() => useLightboxHash("galeria", { names }));
      expect(result.current[0]).toBe(2);
    });

    it("still opens numbered links, so links shared before naming keep working", () => {
      setUrl("/page#galeria-2");
      const { result } = renderHook(() => useLightboxHash("galeria", { names }));
      expect(result.current[0]).toBe(1);
    });

    it("ignores unknown names and numbers past the last name", () => {
      for (const hash of ["#galeria-lake", "#galeria-4", "#galeria-%E0%A4%A"]) {
        setUrl(`/page${hash}`);
        const { result, unmount } = renderHook(() => useLightboxHash("galeria", { names }));
        expect(result.current[0]).toBe(-1);
        unmount();
      }
    });

    it("prefers a name over a number when a name looks like one", () => {
      setUrl("/page#galeria-1");
      const { result } = renderHook(() => useLightboxHash("galeria", { names: ["2", "1", "3"] }));
      expect(result.current[0]).toBe(1);
    });
  });

  it("drives a Lightbox opened from a deep link", async () => {
    setUrl("/page#fotos-4");
    function Page() {
      const [index, setIndex] = useLightboxHash("fotos", { count: slides.length });
      return (
        <Lightbox
          slides={slides}
          open={index >= 0}
          index={Math.max(index, 0)}
          onIndexChange={setIndex}
          onClose={() => setIndex(-1)}
        />
      );
    }
    render(<Page />);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("4 / 12");
    await userEvent.setup().keyboard("{ArrowRight}");
    expect(window.location.hash).toBe("#fotos-5");
    await userEvent.setup().keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(window.location.hash).toBe("");
  });
});
