import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type ForwardRefExoticComponent,
  type ReactElement,
  type RefAttributes,
  type RefObject,
} from "react";
import { cx, useIsoLayoutEffect } from "./dom";
import { defaultGridLabels } from "./labels";
import { getJustifiedLayout, getMasonryLayout, type GridLayout } from "./layout";
import type {
  GridHandle,
  GridProps,
  JustifiedGridProps,
  MasonryGridProps,
  Responsive,
  Slide,
  UniformGridProps,
} from "./types";

interface Placement {
  width: number;
  height: number;
  style?: CSSProperties;
}

interface Arrangement {
  /** One entry per slide; `null` leaves the slide out. */
  items: (Placement | null)[];
  style: CSSProperties;
}

interface BaseGridProps extends GridProps {
  kind: "masonry" | "justified" | "uniform";
  arrange: (width: number, gap: number) => Arrangement;
}

const resolve = <T,>(value: Responsive<T>, width: number): T =>
  typeof value === "function" ? (value as (width: number) => T)(width) : value;

const defaultColumns = (width: number): number => (width < 640 ? 2 : width < 1024 ? 3 : 4);
const defaultRowHeight = (width: number): number => (width < 640 ? 180 : 260);
const ratiosOf = (slides: Slide[]): number[] =>
  slides.map((slide) => (slide.width ?? 0) / (slide.height ?? 0));
const percent = (value: number, total: number): string =>
  `${Number(((value / total) * 100).toFixed(4))}%`;

/** Positions every box absolutely; horizontal values are percentages so a narrower first paint never overflows. */
function absolute(layout: GridLayout, width: number): Arrangement {
  return {
    style: { height: layout.height },
    items: layout.boxes.map((box) =>
      box.width === 0 && box.height === 0
        ? null
        : {
            width: box.width,
            height: box.height,
            style: {
              top: box.top,
              insetInlineStart: percent(box.start, width),
              width: percent(box.width, width),
              height: box.height,
            },
          },
    ),
  };
}

/** Content-box width of the list, from one `ResizeObserver`, or `initial` until it is measured. */
function useContainerWidth(initial: number): [RefObject<HTMLUListElement | null>, number] {
  const ref = useRef<HTMLUListElement>(null);
  const [width, setWidth] = useState(initial);
  useIsoLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    if (list.clientWidth > 0) setWidth(list.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.floor(entry?.contentRect.width ?? 0);
      if (next > 0) setWidth(next);
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

const BaseGrid = /* @__PURE__ */ forwardRef<GridHandle, BaseGridProps>(function BaseGrid(
  {
    slides,
    onOpen,
    gap = 8,
    defaultContainerWidth = 1024,
    labels,
    classNames = {},
    render,
    className,
    style,
    kind,
    arrange,
  },
  ref,
): ReactElement {
  const [listRef, width] = useContainerWidth(defaultContainerWidth);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  useImperativeHandle(ref, () => ({ getThumbnail: (i) => buttons.current[i] ?? null }), []);
  const { items, style: layoutStyle } = arrange(width, resolve(gap, width));
  const { open } = { ...defaultGridLabels, ...labels };

  return (
    <ul
      ref={listRef}
      className={cx("eg-grid", `eg-grid--${kind}`, classNames.root, className)}
      style={{ ...layoutStyle, ...style }}
    >
      {slides.map((slide, i) => {
        const item = items[i];
        if (!item) return null;
        const sizes = `${item.width}px`;
        const custom = render?.image?.({ slide, index: i, ...item, sizes });
        const image =
          custom !== undefined ? (
            custom
          ) : (
            <img
              className={cx("eg-grid-image", classNames.image)}
              src={slide.thumbnail ?? slide.poster ?? slide.src}
              srcSet={slide.srcSet}
              sizes={slide.srcSet ? sizes : undefined}
              width={item.width}
              height={item.height}
              alt={onOpen ? "" : slide.alt || (typeof slide.title === "string" ? slide.title : "")}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          );
        return (
          <li key={i} className={cx("eg-grid-item", classNames.item)} style={item.style}>
            {onOpen ? (
              <button
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                type="button"
                className={cx("eg-grid-button", classNames.button)}
                aria-label={open(i + 1, slides.length, slide)}
                onClick={() => onOpen(i)}
              >
                {image}
              </button>
            ) : (
              image
            )}
          </li>
        );
      })}
    </ul>
  );
});

/** A grid component: its props plus a `ref` to a {@link GridHandle}. */
export type GridComponent<P> = ForwardRefExoticComponent<P & RefAttributes<GridHandle>>;

/**
 * Equal-width columns where each image keeps its aspect ratio. Items fill the
 * shortest column, so the reading and tab order stays left to right, top to bottom.
 */
export const MasonryGrid: GridComponent<MasonryGridProps> = /* @__PURE__ */ forwardRef<
  GridHandle,
  MasonryGridProps
>(function MasonryGrid({ columns = defaultColumns, ...props }, ref) {
  return (
    <BaseGrid
      {...props}
      ref={ref}
      kind="masonry"
      arrange={(width, gap) =>
        absolute(
          getMasonryLayout({
            ratios: ratiosOf(props.slides),
            containerWidth: width,
            columns: resolve(columns, width),
            gap,
          }),
          width,
        )
      }
    />
  );
});

/**
 * Rows of equal height that fill the width edge to edge, each image keeping its
 * aspect ratio and each row as close as possible to `rowHeight`.
 */
export const JustifiedGrid: GridComponent<JustifiedGridProps> = /* @__PURE__ */ forwardRef<
  GridHandle,
  JustifiedGridProps
>(function JustifiedGrid({ rowHeight = defaultRowHeight, lastRow, ...props }, ref) {
  return (
    <BaseGrid
      {...props}
      ref={ref}
      kind="justified"
      arrange={(width, gap) =>
        absolute(
          getJustifiedLayout({
            ratios: ratiosOf(props.slides),
            containerWidth: width,
            targetRowHeight: resolve(rowHeight, width),
            gap,
            lastRow,
          }),
          width,
        )
      }
    />
  );
});

/** Equal cells in a CSS grid. Images are cropped to `aspectRatio`. */
export const UniformGrid: GridComponent<UniformGridProps> = /* @__PURE__ */ forwardRef<
  GridHandle,
  UniformGridProps
>(function UniformGrid({ columns = defaultColumns, aspectRatio = 1, ...props }, ref) {
  return (
    <BaseGrid
      {...props}
      ref={ref}
      kind="uniform"
      arrange={(width, gap) => {
        const count = Math.max(1, Math.floor(resolve(columns, width)) || 1);
        const cell = Math.round((width - gap * (count - 1)) / count);
        const placement = { width: cell, height: Math.round(cell / aspectRatio) };
        return {
          style: {
            "--eg-grid-columns": count,
            "--eg-grid-gap": `${gap}px`,
            "--eg-grid-aspect-ratio": aspectRatio,
          } as CSSProperties,
          items: props.slides.map(() => placement),
        };
      }}
    />
  );
});
