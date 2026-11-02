import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JustifiedGrid, Lightbox, previewOf, UniformGrid, type Slide } from "./index";
import { openAt } from "./test/harness";

const many = (n: number): Slide[] =>
  Array.from({ length: n }, (_, i) => ({
    src: `/big/${i + 1}.jpg`,
    thumbnail: `/big/${i + 1}-t.jpg`,
    width: 1600,
    height: 1000,
    alt: `Big ${i + 1}`,
  }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const strip = () => screen.getByRole("navigation", { name: "Thumbnails" });

describe("thumbnail strip with thousands of slides", () => {
  it("renders only the thumbnails around the current slide", () => {
    render(<Lightbox slides={many(10_000)} open index={5_000} onClose={() => {}} />);
    const buttons = within(strip()).getAllByRole("button");
    expect(buttons.length).toBeLessThan(100);
    const current = within(strip()).getByRole("button", { name: "Show image 5001" });
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current.closest("li")).toHaveAttribute("aria-setsize", "10000");
    expect(current.closest("li")).toHaveAttribute("aria-posinset", "5001");
  });

  it("follows the scroll position once the strip is measured", () => {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(72);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(780);
    render(<Lightbox slides={many(10_000)} open index={0} onClose={() => {}} />);
    const track = strip().querySelector("ul")!;
    act(() => {
      track.scrollLeft = 7_200;
      fireEvent.scroll(track);
    });
    expect(within(strip()).getByRole("button", { name: "Show image 101" })).toBeInTheDocument();
    expect(within(strip()).queryByRole("button", { name: "Show image 1" })).toBeNull();
    expect(within(strip()).getAllByRole("button").length).toBeLessThan(60);
  });

  it("keeps every thumbnail of a small gallery", async () => {
    await openAt(0);
    expect(within(strip()).getAllByRole("button")).toHaveLength(12);
  });
});

describe("pager with many slides", () => {
  it("shows a window of dots around the current slide", () => {
    render(
      <Lightbox slides={many(500)} open index={250} pager thumbnails={false} onClose={() => {}} />,
    );
    const dots = within(screen.getByRole("navigation", { name: "Slides" })).getAllByRole("button");
    expect(dots).toHaveLength(12);
    expect(screen.getByRole("button", { name: "Go to image 251" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("shrinks the edge dots that have more slides past them", () => {
    render(<Lightbox slides={many(500)} open index={250} pager onClose={() => {}} />);
    const dots = within(screen.getByRole("navigation", { name: "Slides" })).getAllByRole("button");
    expect(dots[0]).toHaveAttribute("data-more");
    expect(dots.at(-1)).toHaveAttribute("data-more");
    expect(dots.filter((dot) => dot.hasAttribute("data-more"))).toHaveLength(2);
  });

  it("does not mark an edge with nothing past it", () => {
    render(<Lightbox slides={many(500)} open index={0} pager onClose={() => {}} />);
    const dots = within(screen.getByRole("navigation", { name: "Slides" })).getAllByRole("button");
    expect(dots[0]).not.toHaveAttribute("data-more");
    expect(dots.at(-1)).toHaveAttribute("data-more");
  });

  it("clamps the window at the ends", () => {
    render(<Lightbox slides={many(500)} open index={0} pager onClose={() => {}} />);
    const dots = within(screen.getByRole("navigation", { name: "Slides" })).getAllByRole("button");
    expect(dots[0]).toHaveAccessibleName("Go to image 1");
    expect(dots).toHaveLength(12);
  });
});

describe("video previews", () => {
  const media: Slide[] = [
    { src: "/a.jpg", alt: "A" },
    { src: "/clip.mp4", poster: "/clip-poster.jpg", alt: "Clip" },
    { src: "https://youtu.be/abc123", title: "Talk" },
    { src: "/raw.webm", alt: "Raw" },
  ];

  it("uses posters in the thumbnail strip and never loads a video file as an image", () => {
    render(<Lightbox slides={media} open index={0} onClose={() => {}} />);
    const sources = [...strip().querySelectorAll("img")].map((img) => img.getAttribute("src"));
    expect(sources).toEqual([
      "/a.jpg",
      "/clip-poster.jpg",
      "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
    ]);
  });

  it("uses posters in the grids and never loads a video file as an image", () => {
    render(<UniformGrid slides={media} onOpen={() => {}} />);
    const sources = [...document.querySelectorAll(".eg-grid img")].map((img) =>
      img.getAttribute("src"),
    );
    expect(sources).not.toContain("/raw.webm");
    expect(sources).toContain("/clip-poster.jpg");
    expect(screen.getByRole("button", { name: "Open Raw" })).toBeInTheDocument();
  });

  it("exposes the preview rule for custom grids", () => {
    expect(media.map(previewOf)).toEqual([
      "/a.jpg",
      "/clip-poster.jpg",
      "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
      undefined,
    ]);
  });

  it("only lets the current video fetch metadata", () => {
    const videos: Slide[] = [
      { src: "/v1.mp4", alt: "V1" },
      { src: "/v2.mp4", alt: "V2" },
      { src: "/v3.mp4", alt: "V3" },
    ];
    render(<Lightbox slides={videos} open index={1} onClose={() => {}} />);
    expect(screen.getByLabelText("V2")).toHaveAttribute("preload", "metadata");
    expect(screen.getByLabelText("V1")).toHaveAttribute("preload", "none");
    expect(screen.getByLabelText("V3")).toHaveAttribute("preload", "none");
  });
});

describe("adaptive preload", () => {
  const connection = (info: { saveData?: boolean; effectiveType?: string }) =>
    vi.stubGlobal("navigator", {
      ...navigator,
      connection: { ...info, addEventListener: () => {}, removeEventListener: () => {} },
    });

  it("only fetches the current image with Save-Data on", () => {
    connection({ saveData: true });
    render(<Lightbox slides={many(20)} open index={5} preload={3} onClose={() => {}} />);
    fireEvent.load(screen.getByAltText("Big 6"));
    expect(screen.getByAltText("Big 7")).not.toHaveAttribute("src");
    expect(document.querySelectorAll(".eg-image")).toHaveLength(3);
  });

  it("preloads one slide each way on a slow connection", () => {
    connection({ effectiveType: "3g" });
    render(<Lightbox slides={many(20)} open index={5} preload={3} onClose={() => {}} />);
    fireEvent.load(screen.getByAltText("Big 6"));
    expect(screen.getByAltText("Big 7")).toHaveAttribute("src", "/big/7.jpg");
    expect(document.querySelectorAll(".eg-image")).toHaveLength(3);
  });

  it("uses the preload prop on a fast connection", () => {
    connection({ effectiveType: "4g" });
    render(<Lightbox slides={many(20)} open index={5} preload={3} onClose={() => {}} />);
    expect(document.querySelectorAll(".eg-image")).toHaveLength(7);
  });
});

describe("grids with thousands of slides", () => {
  it("renders only the items near the viewport", () => {
    render(<JustifiedGrid slides={many(5_000)} onOpen={() => {}} />);
    const items = document.querySelectorAll(".eg-grid-item");
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThan(200);
    expect(screen.getByRole("button", { name: "Open Big 1" })).toBeInTheDocument();
  });

  it("renders the items scrolled into view", () => {
    render(<UniformGrid slides={many(5_000)} onOpen={() => {}} columns={4} />);
    const list = document.querySelector<HTMLElement>(".eg-grid")!;
    vi.spyOn(list, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 0, y: -100_000, width: 1024, height: 200_000 }),
    );
    act(() => {
      fireEvent.scroll(window);
    });
    expect(screen.queryByRole("button", { name: "Open Big 1" })).toBeNull();
    expect(document.querySelectorAll(".eg-grid-item").length).toBeLessThan(200);
    const item = document.querySelector<HTMLElement>(".eg-grid-item")!;
    expect(parseFloat(item.style.top)).toBeGreaterThan(90_000);
  });

  it("keeps the item that opened the lightbox mounted after it scrolls away", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    render(<UniformGrid slides={many(5_000)} onOpen={() => {}} columns={4} />);
    await user.click(screen.getByRole("button", { name: "Open Big 2" }));
    const list = document.querySelector<HTMLElement>(".eg-grid")!;
    vi.spyOn(list, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 0, y: -100_000, width: 1024, height: 200_000 }),
    );
    act(() => {
      fireEvent.scroll(window);
    });
    expect(screen.getByRole("button", { name: "Open Big 2" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open Big 1" })).toBeNull();
  });

  it("marks a virtual grid so its stylesheet can switch layout", () => {
    render(<UniformGrid slides={many(5_000)} onOpen={() => {}} />);
    expect(document.querySelector(".eg-grid")).toHaveAttribute("data-virtual");
    expect(document.querySelector<HTMLElement>(".eg-grid-item")!.style.position).toBe("");
  });

  it("does not mark a small grid as virtual", () => {
    render(<UniformGrid slides={many(10)} onOpen={() => {}} />);
    expect(document.querySelector(".eg-grid")).not.toHaveAttribute("data-virtual");
  });

  it("does not re-render when the parent re-renders with the same props", () => {
    const image = vi.fn(() => undefined);
    const renderProp = { image };
    const slides = many(10);
    const onOpen = () => {};
    let bump = () => {};
    function Page() {
      const [n, setN] = useState(0);
      bump = () => setN(n + 1);
      return <JustifiedGrid slides={slides} onOpen={onOpen} render={renderProp} />;
    }
    render(<Page />);
    const calls = image.mock.calls.length;
    act(() => bump());
    expect(image.mock.calls.length).toBe(calls);
  });
});
