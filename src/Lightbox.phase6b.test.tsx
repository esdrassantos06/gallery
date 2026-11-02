import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { openAt } from "./test/harness";

afterEach(() => {
  Reflect.deleteProperty(Element.prototype, "animate");
  vi.restoreAllMocks();
});

describe("cropped-thumbnail flight", () => {
  const rect = (left: number, top: number, width: number, height: number) =>
    ({ left, top, width, height, right: left + width, bottom: top + height }) as DOMRect;

  it("crops along the image's own axes when it closes turned a quarter", async () => {
    const animations: { finish: () => void }[] = [];
    const animate = vi.fn(function () {
      let finish!: () => void;
      const finished = new Promise<void>((resolve) => (finish = resolve));
      const animation = { finished, cancel: vi.fn(), finish };
      animations.push(animation);
      return animation;
    });
    Element.prototype.animate = animate as unknown as Element["animate"];
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (
      this: Element,
    ) {
      if (this.matches(".eg-image")) return rect(200, 100, 500, 800);
      if (this.matches("button")) return rect(10, 10, 100, 100);
      return rect(0, 0, 0, 0);
    });
    const { user } = await openAt(2, { rotate: true });
    act(() => animations.forEach((animation) => animation.finish()));
    await waitFor(() =>
      expect(document.querySelector(".eg-root")).toHaveAttribute("data-state", "open"),
    );
    await user.click(screen.getByRole("button", { name: "Rotate right" }));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(animate).toHaveBeenCalledTimes(2));
    const [keyframes] = animate.mock.calls[1] as unknown as [Keyframe[]];
    expect(keyframes.at(-1)?.clipPath).toBe("inset(0px 150px)");
  });
});
