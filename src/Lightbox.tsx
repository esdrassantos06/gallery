import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { getFocusable, lockScroll, readDuration, readEasing } from "./dom";
import {
  fitContain,
  getFlipTransform,
  getSlideWindow,
  relativeOffset,
  wrapIndex,
  type Rect,
  type Size,
} from "./geometry";
import {
  getEdgeFrictionedDelta,
  getSwipeAxis,
  getSwipeReleaseVerdict,
  getWindowedVelocity,
  pushVelocitySample,
  shouldCloseOnVerticalDrag,
  type SwipeAxis,
  type VelocitySample,
} from "./gestures";
import { defaultIcons } from "./icons";
import { defaultLabels } from "./labels";
import { Thumbnails } from "./Thumbnails";
import type { LightboxClassNames, LightboxProps, Slide } from "./types";
import { useFullscreen } from "./useFullscreen";
import { resolveZoom, useZoom } from "./useZoom";
import { getWheelFactor, type Point } from "./zoom";

type Phase = "closed" | "opening" | "open" | "closing";

type Mode = "swipe" | "pan" | "pinch" | null;

type ImageStatus = "loaded" | "error";

interface Tap {
  id: number;
  x: number;
  y: number;
  t: number;
  moved: boolean;
  onMedia: boolean;
}

const TAP_MAX_MS = 300;
const TAP_SLOP = 10;
const DOUBLE_TAP_DISTANCE = 30;

interface Drag {
  id: number;
  x: number;
  y: number;
  axis: SwipeAxis | undefined;
  samples: VelocitySample[];
}

const FALLBACK_SCALE = 0.92;

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const subscribeNothing = () => () => {};

function cx(...names: (string | false | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

function isOnScreen(rect: Rect): boolean {
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.left + rect.width > 0 &&
    rect.top + rect.height > 0 &&
    rect.left < window.innerWidth &&
    rect.top < window.innerHeight
  );
}

function contentBox(el: HTMLElement): Size {
  const style = window.getComputedStyle(el);
  const pad = (side: string) => parseFloat(style.getPropertyValue(`padding-${side}`)) || 0;
  return {
    width: Math.max(el.clientWidth - pad("left") - pad("right"), 0),
    height: Math.max(el.clientHeight - pad("top") - pad("bottom"), 0),
  };
}

/** Keyframes that grow `media` out of `origin`, or a zoom and fade when there is no usable origin. */
function openKeyframes(media: HTMLElement, origin: HTMLElement | null | undefined): Keyframe[] {
  const to = media.getBoundingClientRect();
  const from = origin?.getBoundingClientRect();
  if (from && isOnScreen(from) && to.width > 0 && to.height > 0) {
    const { x, y, scale } = getFlipTransform(from, to);
    return [{ transform: `translate(${x}px, ${y}px) scale(${scale})` }, { transform: "none" }];
  }
  return [
    { opacity: 0, transform: `scale(${FALLBACK_SCALE})` },
    { opacity: 1, transform: "none" },
  ];
}

/**
 * Accessible image lightbox. Render it next to your gallery, keep it mounted,
 * and drive it with `open`, `index`, `onClose` and `onIndexChange`.
 *
 * It portals a modal dialog into `container` (or `document.body`) on the
 * client only, so it is safe to render on the server.
 *
 * @example
 * ```tsx
 * const [index, setIndex] = useState(-1);
 * <Lightbox
 *   slides={slides}
 *   open={index >= 0}
 *   index={Math.max(index, 0)}
 *   onIndexChange={setIndex}
 *   onClose={() => setIndex(-1)}
 * />
 * ```
 */
export function Lightbox({
  slides,
  open,
  index = 0,
  onClose,
  onIndexChange,
  onAfterOpen,
  onAfterClose,
  loop = true,
  transition = "slide",
  preload = 2,
  closeOnBackdropClick = true,
  swipe = true,
  swipeThreshold = 50,
  keyboard = true,
  thumbnails = true,
  zoom: zoomProp,
  fullscreen = true,
  getThumbnail,
  labels: labelOverrides,
  icons: iconOverrides,
  classNames = {},
  render = {},
  className,
  style,
  container,
}: LightboxProps): ReactElement | null {
  const total = slides.length;
  const clamp = (i: number) => Math.min(Math.max(Math.trunc(i) || 0, 0), Math.max(total - 1, 0));

  const [phase, setPhase] = useState<Phase>(open ? "opening" : "closed");
  const [current, setCurrent] = useState(() => clamp(index));
  const [lastOpen, setLastOpen] = useState(open);
  const [lastIndex, setLastIndex] = useState(index);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setPhase("opening");
      setCurrent(clamp(index));
    } else if (phase !== "closed") {
      setPhase("closing");
    }
  }
  if (index !== lastIndex) {
    setLastIndex(index);
    if (open) setCurrent(clamp(index));
  }
  const active = clamp(current);

  const [lastActive, setLastActive] = useState(active);
  const [jumps, setJumps] = useState<ReadonlySet<number>>(() => new Set());
  if (active !== lastActive) {
    setLastActive(active);
    setJumps(
      new Set(
        getSlideWindow(active, total, preload, loop)
          .filter((s) => Math.abs(s.offset - relativeOffset(s.index, lastActive, total, loop)) > 1)
          .map((s) => s.index),
      ),
    );
  }

  const isClient = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const shown = isClient && phase !== "closed" && total > 0;

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const draggedRef = useRef(false);
  const frameRef = useRef(0);
  const pointersRef = useRef(new Map<number, Point>());
  const modeRef = useRef<Mode>(null);
  const tapRef = useRef<Tap | null>(null);
  const lastTapRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const [box, setBox] = useState<Size | null>(null);
  const [natural, setNatural] = useState<Record<string, Size>>({});
  const [status, setStatus] = useState<Record<string, ImageStatus>>({});

  const zoomConfig = resolveZoom(zoomProp);
  const zoom = useZoom(zoomConfig, stageRef);
  const fs = useFullscreen(rootRef, shown);

  const labels = { ...defaultLabels, ...labelOverrides };
  const icons = { ...defaultIcons, ...iconOverrides };
  const cn = (part: keyof LightboxClassNames, base: string) => cx(base, classNames[part]);

  const hasPrev = loop ? total > 1 : active > 0;
  const hasNext = loop ? total > 1 : active < total - 1;

  const go = (target: number) => {
    if (total === 0) return;
    const next = loop ? wrapIndex(target, total) : clamp(target);
    if (next === active) return;
    setCurrent(next);
    onIndexChange?.(next);
  };

  useEffect(() => {
    if (!shown) return;
    return lockScroll();
  }, [shown]);

  useIsoLayoutEffect(() => {
    if (!shown) return;
    const active = document.activeElement;
    openerRef.current = active instanceof HTMLElement ? active : null;
    rootRef.current?.focus({ preventScroll: true });
  }, [shown]);

  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    if (!shown || !stage) return;
    const measure = () =>
      setBox((prev) => {
        const next = contentBox(stage);
        return prev && prev.width === next.width && prev.height === next.height ? prev : next;
      });
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [shown]);

  const measured = box !== null;
  const zoomReset = zoom.reset;

  useIsoLayoutEffect(() => {
    zoomReset();
  }, [active, box?.width, box?.height, zoomReset]);

  const finishOpen = useCallback(() => {
    setPhase("open");
    onAfterOpen?.();
  }, [onAfterOpen]);

  const finishClose = useCallback(() => {
    const thumbnail = getThumbnail?.(active);
    const target = thumbnail?.isConnected ? thumbnail : openerRef.current;
    if (target?.isConnected) target.focus();
    setPhase("closed");
    onAfterClose?.();
  }, [getThumbnail, active, onAfterClose]);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!shown || !root || !measured || (phase !== "opening" && phase !== "closing")) return;
    const finish = phase === "opening" ? finishOpen : finishClose;
    if (phase === "closing") {
      zoom.reset();
      fs.exit();
    }
    const media =
      root.querySelector<HTMLElement>(".eg-slide[data-current] .eg-image") ??
      root.querySelector<HTMLElement>(".eg-slide[data-current] > *");
    const duration = readDuration(root);
    if (!media || duration === 0 || typeof media.animate !== "function") {
      finish();
      return;
    }
    const keyframes = openKeyframes(media, getThumbnail?.(active));
    const animation = media.animate(phase === "opening" ? keyframes : [...keyframes].reverse(), {
      duration,
      easing: readEasing(root),
      fill: phase === "closing" ? "forwards" : "none",
    });
    let cancelled = false;
    animation.finished.then(
      () => {
        if (!cancelled) finish();
      },
      () => {},
    );
    return () => {
      cancelled = true;
      animation.cancel();
    };
  }, [phase, shown, measured]);

  const setDragStyle = (x: number, y: number, progress: number) => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      root.style.setProperty("--eg-drag-x", `${x}px`);
      root.style.setProperty("--eg-drag-y", `${y}px`);
      root.style.setProperty("--eg-drag-progress", String(progress));
    });
  };

  const endDrag = () => {
    dragRef.current = null;
    cancelAnimationFrame(frameRef.current);
    const root = rootRef.current;
    if (!root) return;
    root.removeAttribute("data-dragging");
    for (const name of ["--eg-drag-x", "--eg-drag-y", "--eg-drag-progress"]) {
      root.style.removeProperty(name);
    }
  };

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const capture = (ids: Iterable<number>) => {
    for (const id of ids) {
      try {
        stageRef.current?.setPointerCapture?.(id);
      } catch {
        continue;
      }
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    draggedRef.current = false;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const pointers = pointersRef.current;
    const point = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, point);
    if (pointers.size === 1) {
      tapRef.current = {
        id: e.pointerId,
        ...point,
        t: performance.now(),
        moved: false,
        onMedia: e.target instanceof Element && !!e.target.closest(".eg-zoom"),
      };
    }
    if (pointers.size === 2 && zoomConfig) {
      endDrag();
      tapRef.current = null;
      draggedRef.current = true;
      modeRef.current = "pinch";
      capture(pointers.keys());
      const [a, b] = [...pointers.values()];
      if (a && b) zoom.pinchStart(a, b);
      return;
    }
    if (pointers.size > 1) return;
    if (zoomConfig && zoom.isZoomed()) {
      modeRef.current = "pan";
      capture([e.pointerId]);
      zoom.panStart(point);
      return;
    }
    if (!swipe || !e.isPrimary) return;
    modeRef.current = "swipe";
    dragRef.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      axis: undefined,
      samples: [{ x: e.clientX, y: e.clientY, t: performance.now() }],
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current;
    if (!pointers.has(e.pointerId)) return;
    const point = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, point);
    const tap = tapRef.current;
    if (tap?.id === e.pointerId && Math.hypot(point.x - tap.x, point.y - tap.y) > TAP_SLOP) {
      tap.moved = true;
    }
    if (modeRef.current === "pinch") {
      const [a, b] = [...pointers.values()];
      if (a && b) zoom.pinchMove(a, b);
      return;
    }
    if (modeRef.current === "pan") {
      if (tap?.moved) draggedRef.current = true;
      zoom.panMove(point);
      return;
    }
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    drag.samples = pushVelocitySample(drag.samples, {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
    });
    const axis = getSwipeAxis(dx, dy, drag.axis);
    if (!axis) return;
    if (!drag.axis) {
      drag.axis = axis;
      draggedRef.current = true;
      rootRef.current?.setAttribute("data-dragging", axis);
      capture([e.pointerId]);
    }
    if (axis === "horizontal") setDragStyle(getEdgeFrictionedDelta(dx, hasPrev, hasNext), 0, 0);
    else setDragStyle(0, dy, Math.min(Math.abs(dy) / window.innerHeight, 1));
  };

  const releaseSwipe = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    const now = performance.now();
    const velocity = getWindowedVelocity(
      pushVelocitySample(drag.samples, { x: e.clientX, y: e.clientY, t: now }),
      now,
    );
    const axis = drag.axis;
    endDrag();
    if (axis === "horizontal") {
      const verdict = getSwipeReleaseVerdict({
        deltaX: dx,
        velocityX: velocity.x,
        threshold: swipeThreshold,
        viewportWidth: box?.width ?? window.innerWidth,
      });
      if (verdict === "next" && hasNext) go(active + 1);
      if (verdict === "prev" && hasPrev) go(active - 1);
    } else if (
      axis === "vertical" &&
      shouldCloseOnVerticalDrag(dy, velocity.y, window.innerHeight)
    ) {
      onClose();
    }
  };

  const detectDoubleTap = (e: PointerEvent<HTMLDivElement>) => {
    const tap = tapRef.current;
    tapRef.current = null;
    const now = performance.now();
    if (!tap || tap.id !== e.pointerId || tap.moved || now - tap.t > TAP_MAX_MS) return;
    if (!zoomConfig || !tap.onMedia) {
      lastTapRef.current = null;
      return;
    }
    const last = lastTapRef.current;
    if (
      last &&
      now - last.t < TAP_MAX_MS &&
      Math.hypot(tap.x - last.x, tap.y - last.y) < DOUBLE_TAP_DISTANCE
    ) {
      lastTapRef.current = null;
      zoom.toggle({ x: e.clientX, y: e.clientY });
      return;
    }
    lastTapRef.current = { x: tap.x, y: tap.y, t: now };
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const pointers = pointersRef.current;
    if (!pointers.delete(e.pointerId)) return;
    const mode = modeRef.current;
    if (mode === "pinch") {
      if (pointers.size >= 2) return;
      zoom.end();
      modeRef.current = null;
      const rest = [...pointers.values()][0];
      if (rest && zoom.isZoomed()) {
        modeRef.current = "pan";
        zoom.panStart(rest);
      }
      return;
    }
    modeRef.current = null;
    if (mode === "pan") zoom.end();
    if (mode === "swipe") releaseSwipe(e);
    detectDoubleTap(e);
  };

  const onPointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (modeRef.current === "pinch" || modeRef.current === "pan") zoom.end();
    modeRef.current = null;
    tapRef.current = null;
    endDrag();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const root = rootRef.current;
    if (!root) return;
    if (e.key === "Tab") {
      const focusable = getFocusable(root);
      const first = focusable[0];
      const last = focusable.at(-1);
      const inside = focusable.includes(document.activeElement as HTMLElement);
      if (!first || !last) {
        e.preventDefault();
      } else if (e.shiftKey && (!inside || document.activeElement === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || document.activeElement === last)) {
        e.preventDefault();
        first.focus();
      }
      return;
    }
    if (!keyboard || phase === "closing" || e.metaKey || e.ctrlKey || e.altKey) return;
    const actions: Record<string, () => void> = {
      Escape: onClose,
      ArrowLeft: () => go(active - 1),
      ArrowRight: () => go(active + 1),
      Home: () => go(0),
      End: () => go(total - 1),
    };
    if (zoomConfig) {
      actions["+"] = actions["="] = () => zoom.zoomBy(zoomConfig.step);
      actions["-"] = () => zoom.zoomBy(1 / zoomConfig.step);
      actions["0"] = () => zoom.zoomTo(1);
    }
    const action = actions[e.key];
    if (!action) return;
    e.preventDefault();
    action();
  };

  const keyHandlerRef = useRef(onKeyDown);
  useIsoLayoutEffect(() => {
    keyHandlerRef.current = onKeyDown;
  });
  useEffect(() => {
    if (!shown) return;
    const listener = (e: KeyboardEvent) => keyHandlerRef.current(e);
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [shown]);

  const wheelHandlerRef = useRef<(e: WheelEvent) => void>(() => {});
  useIsoLayoutEffect(() => {
    wheelHandlerRef.current = (e: WheelEvent) => {
      if (!zoomConfig?.wheel || !zoom.targetRef.current) return;
      e.preventDefault();
      zoom.zoomBy(
        getWheelFactor(e.deltaY, e.deltaMode, e.ctrlKey),
        { x: e.clientX, y: e.clientY },
        false,
      );
    };
  });
  useEffect(() => {
    const stage = stageRef.current;
    if (!shown || !stage) return;
    const listener = (e: WheelEvent) => wheelHandlerRef.current(e);
    stage.addEventListener("wheel", listener, { passive: false });
    return () => stage.removeEventListener("wheel", listener);
  }, [shown]);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    const focused = document.activeElement;
    if (!root || !(focused instanceof HTMLElement)) return;
    if ((root.contains(focused) && focused.matches(":disabled")) || focused === document.body) {
      root.focus({ preventScroll: true });
    }
  });

  const onSlideClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || draggedRef.current || !closeOnBackdropClick) return;
    onClose();
  };

  if (!shown) return null;

  const slide = slides[active] as Slide;
  const button = (part: "button" | "arrow", base: string) =>
    cx(cn("button", "eg-button"), part === "arrow" && cn("arrow", base));

  const closeButton = (
    <button
      type="button"
      className={button("button", "")}
      aria-label={labels.close}
      onClick={onClose}
    >
      {icons.close}
    </button>
  );

  const defaultCaption =
    slide.title || slide.description ? (
      <>
        {slide.title ? <h2 className="eg-caption-title">{slide.title}</h2> : null}
        {slide.description ? <p className="eg-caption-description">{slide.description}</p> : null}
      </>
    ) : null;
  const caption: ReactNode = render.caption ? render.caption(slide, active) : defaultCaption;

  const renderMedia = (
    item: Slide,
    i: number,
    isCurrent: boolean,
  ): { node: ReactNode; builtIn: boolean } => {
    const naturalSize =
      item.width && item.height ? { width: item.width, height: item.height } : natural[item.src];
    const size =
      box && naturalSize
        ? fitContain(naturalSize.width, naturalSize.height, box.width, box.height)
        : undefined;
    const custom = render.slide?.({
      slide: item,
      index: i,
      current: isCurrent,
      width: size?.width ?? box?.width ?? 0,
      height: size?.height ?? box?.height ?? 0,
    });
    if (custom !== undefined) return { node: custom, builtIn: false };
    if (status[item.src] === "error") {
      return { node: <p className="eg-error">{labels.loadError}</p>, builtIn: false };
    }
    const renderedWidth =
      size && isCurrent && zoomConfig && zoom.scale > 1
        ? size.width * zoomConfig.maxScale
        : size?.width;
    const image = (
      <img
        className={cn("image", "eg-image")}
        src={item.src}
        srcSet={item.srcSet}
        sizes={
          item.srcSet
            ? (item.sizes ?? (renderedWidth ? `${Math.round(renderedWidth)}px` : "100vw"))
            : undefined
        }
        alt={item.alt ?? ""}
        width={size?.width}
        height={size?.height}
        style={size ? { width: size.width, height: size.height } : undefined}
        decoding="async"
        draggable={false}
        onLoad={(e) => {
          const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
          setStatus((prev) =>
            prev[item.src] === "loaded" ? prev : { ...prev, [item.src]: "loaded" },
          );
          if (!naturalSize && width && height) {
            setNatural((prev) => ({ ...prev, [item.src]: { width, height } }));
          }
        }}
        onError={() => setStatus((prev) => ({ ...prev, [item.src]: "error" }))}
      />
    );
    return {
      node: zoomConfig ? (
        <div className="eg-zoom" ref={isCurrent ? zoom.targetRef : undefined}>
          {image}
        </div>
      ) : (
        image
      ),
      builtIn: true,
    };
  };

  const windowSlides = getSlideWindow(active, total, preload, loop).map(({ index: i, offset }) => ({
    index: i,
    offset,
    isCurrent: i === active,
    media: renderMedia(slides[i] as Slide, i, i === active),
  }));
  const currentIsImage = windowSlides.find((s) => s.isCurrent)?.media.builtIn ?? false;
  const showThumbnails = thumbnails && total > 1;

  const toolbarButtons = (
    <>
      {zoomConfig && currentIsImage ? (
        <>
          <button
            type="button"
            className={button("button", "")}
            aria-label={labels.zoomIn}
            disabled={zoom.scale >= zoomConfig.maxScale}
            onClick={() => zoom.zoomBy(zoomConfig.step)}
          >
            {icons.zoomIn}
          </button>
          <button
            type="button"
            className={button("button", "")}
            aria-label={labels.zoomOut}
            disabled={zoom.scale <= zoomConfig.minScale}
            onClick={() => zoom.zoomBy(1 / zoomConfig.step)}
          >
            {icons.zoomOut}
          </button>
        </>
      ) : null}
      {fullscreen && fs.supported ? (
        <button
          type="button"
          className={button("button", "")}
          aria-label={fs.active ? labels.exitFullscreen : labels.enterFullscreen}
          onClick={fs.toggle}
        >
          {fs.active ? icons.exitFullscreen : icons.enterFullscreen}
        </button>
      ) : null}
      {closeButton}
    </>
  );

  const dialog = (
    <div
      ref={rootRef}
      className={cx(cn("root", "eg-root"), className)}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-label={labels.dialog}
      tabIndex={-1}
      data-state={phase}
      data-transition={transition}
      data-zoomed={zoom.scale > 1 || undefined}
      data-thumbnails={showThumbnails || undefined}
    >
      <div className={cn("backdrop", "eg-backdrop")} />
      <div
        ref={stageRef}
        className={cn("stage", "eg-stage")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {windowSlides.map(({ index: i, offset, isCurrent, media }) => (
          <div
            key={i}
            className={cn("slide", "eg-slide")}
            style={{ "--eg-offset": offset } as CSSProperties}
            data-current={isCurrent || undefined}
            data-jump={jumps.has(i) || undefined}
            data-status={
              media.builtIn
                ? (status[(slides[i] as Slide).src] ?? "loading")
                : status[(slides[i] as Slide).src]
            }
            role="presentation"
            aria-hidden={isCurrent ? undefined : true}
            onClick={onSlideClick}
          >
            {media.node}
          </div>
        ))}
      </div>
      <div className={cn("topBar", "eg-top-bar")}>
        <div className={cn("counter", "eg-counter")}>
          {render.counter ? render.counter(active + 1, total) : labels.counter(active + 1, total)}
        </div>
        <div className={cn("toolbar", "eg-toolbar")}>
          {render.toolbar ? render.toolbar(toolbarButtons, slide, active) : toolbarButtons}
        </div>
      </div>
      {total > 1 ? (
        <>
          <button
            type="button"
            className={button("arrow", "eg-arrow eg-arrow-prev")}
            aria-label={labels.previous}
            disabled={!hasPrev}
            onClick={() => go(active - 1)}
          >
            {icons.previous}
          </button>
          <button
            type="button"
            className={button("arrow", "eg-arrow eg-arrow-next")}
            aria-label={labels.next}
            disabled={!hasNext}
            onClick={() => go(active + 1)}
          >
            {icons.next}
          </button>
        </>
      ) : null}
      {caption != null && caption !== false ? (
        <div className={cn("caption", "eg-caption")}>{caption}</div>
      ) : null}
      {showThumbnails ? (
        <Thumbnails
          slides={slides}
          active={active}
          labels={labels}
          className={cn("thumbnails", "eg-thumbnails")}
          thumbnailClassName={cn("thumbnail", "eg-thumbnail")}
          renderThumbnail={render.thumbnail}
          onSelect={go}
        />
      ) : null}
      <div className="eg-sr-only" aria-live="polite" aria-atomic="true">
        {labels.announcement(active + 1, total, slide)}
      </div>
    </div>
  );

  return createPortal(dialog, container ?? document.body);
}
