import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { GalleryFilter, Lightbox, UniformGrid, type GridHandle, type Slide } from "./index";

describe("GalleryFilter", () => {
  it("is a labelled group of toggle buttons with an All option", () => {
    render(
      <GalleryFilter categories={["roofs", "walls"]} value="walls" onChange={() => {}} count={3} />,
    );
    const group = screen.getByRole("group", { name: "Filter" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["All", "roofs", "walls"]);
    expect(buttons.map((b) => b.getAttribute("aria-pressed"))).toEqual(["false", "false", "true"]);
    expect(buttons.every((b) => b.getAttribute("type") === "button")).toBe(true);
  });

  it("presses All when no category is selected", () => {
    render(<GalleryFilter categories={["roofs"]} value={null} onChange={() => {}} count={3} />);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
  });

  it("reports the chosen category, or null for All", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<GalleryFilter categories={["roofs"]} value="roofs" onChange={onChange} count={1} />);
    await user.click(screen.getByRole("button", { name: "All" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
    await user.click(screen.getByRole("button", { name: "roofs" }));
    expect(onChange).toHaveBeenLastCalledWith("roofs");
  });

  it("announces the visible count in a polite live region", () => {
    const { rerender } = render(
      <GalleryFilter categories={["a"]} value={null} onChange={() => {}} count={5} />,
    );
    const status = screen.getByText("5 images");
    expect(status).toHaveAttribute("aria-live", "polite");
    rerender(<GalleryFilter categories={["a"]} value="a" onChange={() => {}} count={1} />);
    expect(status).toHaveTextContent("1 image");
  });

  it("takes translated labels and class names", () => {
    render(
      <GalleryFilter
        categories={["roofs", "walls"]}
        value={null}
        onChange={() => {}}
        count={2}
        labels={{
          group: "Filtrar por ofício",
          all: "Todos",
          category: (c) => (c === "roofs" ? "Telhados" : "Paredes"),
          count: (n) => `${n} fotos`,
        }}
        classNames={{ root: "r", group: "g", button: "b", status: "s" }}
        className="extra"
      />,
    );
    const group = screen.getByRole("group", { name: "Filtrar por ofício" });
    expect(group).toHaveClass("eg-filter-group", "g");
    expect(group.parentElement).toHaveClass("eg-filter", "r", "extra");
    expect(within(group).getByRole("button", { name: "Telhados" })).toHaveClass(
      "eg-filter-button",
      "b",
    );
    expect(screen.getByText("2 fotos")).toHaveClass("eg-filter-status", "s");
  });
});

interface Photo extends Slide {
  trade: "roofs" | "walls";
}

const photos: Photo[] = [
  { src: "/1.jpg", width: 800, height: 600, alt: "Roof one", trade: "roofs" },
  { src: "/2.jpg", width: 800, height: 600, alt: "Wall one", trade: "walls" },
  { src: "/3.jpg", width: 800, height: 600, alt: "Roof two", trade: "roofs" },
  { src: "/4.jpg", width: 800, height: 600, alt: "Wall two", trade: "walls" },
];

function FilteredGallery() {
  const [trade, setTrade] = useState<Photo["trade"] | null>(null);
  const [index, setIndex] = useState(-1);
  const grid = useRef<GridHandle>(null);
  const shown = trade ? photos.filter((p) => p.trade === trade) : photos;
  return (
    <>
      <GalleryFilter
        categories={["roofs", "walls"]}
        value={trade}
        onChange={setTrade}
        count={shown.length}
      />
      <UniformGrid ref={grid} slides={shown} onOpen={setIndex} />
      <Lightbox
        slides={shown}
        open={index >= 0}
        index={Math.max(index, 0)}
        onIndexChange={setIndex}
        onClose={() => setIndex(-1)}
        getThumbnail={(i) => grid.current?.getThumbnail(i)}
      />
    </>
  );
}

describe("filter, grid and Lightbox together", () => {
  it("keeps Lightbox indices on the filtered list and returns focus to the photo", async () => {
    const user = userEvent.setup();
    render(<FilteredGallery />);
    await user.click(screen.getByRole("button", { name: "walls" }));
    expect(screen.getByText("2 images")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open Roof one" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Open Wall two" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("2 / 2")).toBeInTheDocument();
    expect(within(dialog).getByRole("img", { name: "Wall two" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Open Wall two" })).toHaveFocus(),
    );
  });
});
