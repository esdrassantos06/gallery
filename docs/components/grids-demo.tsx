"use client";
import { useRef, useState } from "react";
import {
  GalleryFilter,
  JustifiedGrid,
  Lightbox,
  MasonryGrid,
  UniformGrid,
  type GridHandle,
  type GridProps,
  type Slide,
} from "../../src";
import { samples } from "../../playground/data";
import { Segmented } from "./controls";

const layouts = ["justified", "masonry", "uniform"] as const;
const shapes = ["Landscape", "Portrait", "Square"] as const;

type Layout = (typeof layouts)[number];
type Shape = (typeof shapes)[number];

function shapeOf(slide: Slide): Shape {
  const ratio = (slide.width ?? 1) / (slide.height ?? 1);
  return ratio > 1.05 ? "Landscape" : ratio < 0.95 ? "Portrait" : "Square";
}

/** Props of {@link GridsDemo}. */
export interface GridsDemoProps {
  /** Layout shown first. */
  layout?: Layout;
  /** Show buttons that switch between the three layouts. */
  switcher?: boolean;
  /** Show a `GalleryFilter` by shape above the grid. */
  filter?: boolean;
  /** Open the lightbox when an item is clicked. Without it, items are plain images. */
  lightbox?: boolean;
  /** How many samples to show. */
  count?: number;
}

/** A live grid, optionally with the filter and the lightbox, for MDX pages and the home page. */
export function GridsDemo({
  layout: initial = "justified",
  switcher = false,
  filter = false,
  lightbox = true,
  count,
}: GridsDemoProps) {
  const [layout, setLayout] = useState<Layout>(initial);
  const [shape, setShape] = useState<Shape | null>(null);
  const [index, setIndex] = useState(-1);
  const grid = useRef<GridHandle>(null);
  const all = count === undefined ? samples : samples.slice(0, count);
  const shown = shape ? all.filter((slide) => shapeOf(slide) === shape) : all;
  const props: GridProps = {
    slides: shown,
    onOpen: lightbox ? setIndex : undefined,
    defaultContainerWidth: 720,
  };

  return (
    <div className="not-prose bg-fd-card my-6 flex flex-col gap-4 rounded-xl border p-3">
      {(filter || switcher) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {filter && (
            <GalleryFilter
              categories={shapes}
              value={shape}
              onChange={setShape}
              count={shown.length}
              labels={{ group: "Filter by shape" }}
            />
          )}
          {switcher && (
            <Segmented label="Layout" options={layouts} value={layout} onChange={setLayout} />
          )}
        </div>
      )}
      {layout === "justified" ? (
        <JustifiedGrid ref={grid} {...props} rowHeight={(w) => (w < 640 ? 120 : 180)} />
      ) : layout === "masonry" ? (
        <MasonryGrid ref={grid} {...props} />
      ) : (
        <UniformGrid ref={grid} {...props} aspectRatio={4 / 3} />
      )}
      {lightbox && (
        <Lightbox
          slides={shown}
          open={index >= 0}
          index={Math.max(index, 0)}
          onIndexChange={setIndex}
          onClose={() => setIndex(-1)}
          getThumbnail={(i) => grid.current?.getThumbnail(i)}
        />
      )}
    </div>
  );
}
