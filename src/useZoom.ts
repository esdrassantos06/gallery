import { useCallback, useRef, useState, type RefObject } from "react";
import type { ZoomOptions } from "./types";
import {
  clampPanAxis,
  clampScale,
  getPinchPan,
  getPinchScale,
  getPointerDistance,
  getPointZoomPan,
  shouldCloseOnPinch,
  type Point,
} from "./zoom";

/** Zoom options with every default filled in. */
export interface ZoomConfig {
  minScale: number;
  maxScale: number;
  step: number;
  doubleTapScale: number;
  wheel: boolean;
}

/** Resolves the `zoom` prop. Returns `null` when zoom is off. */
export function resolveZoom(zoom: boolean | ZoomOptions | undefined): ZoomConfig | null {
  if (zoom === false) return null;
  const options = zoom === true || zoom === undefined ? {} : zoom;
  const minScale = Math.max(options.minScale ?? 1, 0.1);
  const maxScale = Math.max(options.maxScale ?? 3, minScale);
  return {
    minScale,
    maxScale,
    step: Math.max(options.step ?? 1.5, 1.01),
    doubleTapScale: clampScale(options.doubleTapScale ?? 2, minScale, maxScale),
    wheel: options.wheel ?? true,
  };
}

interface Transform {
  scale: number;
  x: number;
  y: number;
}

interface Metrics {
  center: Point;
  width: number;
  height: number;
  stage: { width: number; height: number };
  offset: Point;
}

type Gesture =
  | { type: "pinch"; distance: number; mid: Point; start: Transform; free: boolean; peak: number }
  | { type: "pan"; point: Point; start: Transform };

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

/** What {@link useZoom} returns. */
export interface ZoomController {
  /** Attach to the wrapper of the current slide's media. */
  targetRef: RefObject<HTMLDivElement | null>;
  /** Committed scale, for rendering button states. */
  scale: number;
  /** Whether the current transform is magnified, read synchronously by gesture handlers. */
  isZoomed: () => boolean;
  zoomTo: (scale: number, client?: Point, animate?: boolean) => void;
  zoomBy: (factor: number, client?: Point, animate?: boolean) => void;
  toggle: (client: Point) => void;
  reset: () => void;
  /** Starts a pinch. With `closable`, a pinch from fit may shrink freely and close on release. */
  pinchStart: (a: Point, b: Point, closable?: boolean) => void;
  pinchMove: (a: Point, b: Point) => void;
  panStart: (point: Point) => void;
  panMove: (point: Point) => void;
  /** Settles the gesture. Returns true when a pinch asks to close the lightbox instead. */
  end: () => boolean;
}

/**
 * Zoom state of the current slide. Transforms are written straight to the
 * wrapper element during gestures; React state only tracks the committed scale.
 */
export function useZoom(
  config: ZoomConfig | null,
  stageRef: RefObject<HTMLElement | null>,
): ZoomController {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const current = useRef<Transform>(IDENTITY);
  const gesture = useRef<Gesture | null>(null);
  const [scale, setScale] = useState(1);

  const measure = useCallback((): Metrics | null => {
    const target = targetRef.current;
    const stage = stageRef.current;
    if (!target || !stage) return null;
    const { scale, x, y } = current.current;
    const rect = target.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2 - x, y: rect.top + rect.height / 2 - y };
    return {
      center,
      width: rect.width / scale,
      height: rect.height / scale,
      stage: { width: stageRect.width, height: stageRect.height },
      offset: {
        x: center.x - (stageRect.left + stageRect.width / 2),
        y: center.y - (stageRect.top + stageRect.height / 2),
      },
    };
  }, [stageRef]);

  const clamp = (next: Transform, metrics: Metrics): Transform => ({
    scale: next.scale,
    x: clampPanAxis(next.x, metrics.width * next.scale, metrics.stage.width, metrics.offset.x),
    y: clampPanAxis(next.y, metrics.height * next.scale, metrics.stage.height, metrics.offset.y),
  });

  const write = useCallback((next: Transform, animate: boolean) => {
    current.current = next;
    const target = targetRef.current;
    if (!target) return;
    target.toggleAttribute("data-gesture", !animate);
    target.style.transform =
      next.scale === 1 && next.x === 0 && next.y === 0
        ? ""
        : `translate(${next.x}px, ${next.y}px) scale(${next.scale})`;
  }, []);

  const commit = useCallback(
    (next: Transform, animate: boolean) => {
      write(next, animate);
      setScale(next.scale);
    },
    [write],
  );

  const zoomTo = useCallback(
    (target: number, client?: Point, animate = true) => {
      const metrics = measure();
      if (!config || !metrics) return;
      const prev = current.current;
      const scale = clampScale(target, config.minScale, config.maxScale);
      if (scale === 1) return commit(IDENTITY, animate);
      const point = client
        ? { x: client.x - metrics.center.x, y: client.y - metrics.center.y }
        : { x: 0, y: 0 };
      const pan = getPointZoomPan(point, prev, prev.scale, scale);
      commit(clamp({ scale, ...pan }, metrics), animate);
    },
    [config, measure, commit],
  );

  const zoomBy = useCallback(
    (factor: number, client?: Point, animate = true) =>
      zoomTo(current.current.scale * factor, client, animate),
    [zoomTo],
  );

  const reset = useCallback(() => {
    gesture.current = null;
    current.current = IDENTITY;
    stageRef.current?.querySelectorAll<HTMLElement>(".eg-zoom").forEach((el) => {
      el.setAttribute("data-gesture", "");
      el.style.transform = "";
    });
    setScale(1);
  }, [stageRef]);

  const toggle = useCallback(
    (client: Point) => {
      if (!config) return;
      if (current.current.scale > 1) zoomTo(1);
      else zoomTo(config.doubleTapScale, client);
    },
    [config, zoomTo],
  );

  const pinchStart = (a: Point, b: Point, closable = false) => {
    const metrics = measure();
    if (!config || !metrics) return;
    const start = current.current;
    gesture.current = {
      type: "pinch",
      distance: getPointerDistance(a, b),
      mid: { x: (a.x + b.x) / 2 - metrics.center.x, y: (a.y + b.y) / 2 - metrics.center.y },
      start,
      free: closable && start.scale <= 1,
      peak: start.scale,
    };
  };

  const pinchMove = (a: Point, b: Point) => {
    const g = gesture.current;
    const metrics = measure();
    if (!config || !metrics || g?.type !== "pinch") return;
    const scale = getPinchScale(
      g.distance,
      getPointerDistance(a, b),
      g.start.scale,
      config.minScale,
      config.maxScale,
      g.free,
    );
    g.peak = Math.max(g.peak, scale);
    const mid = { x: (a.x + b.x) / 2 - metrics.center.x, y: (a.y + b.y) / 2 - metrics.center.y };
    write({ scale, ...getPinchPan(mid, g.mid, g.start, g.start.scale, scale) }, false);
  };

  const panStart = (point: Point) => {
    gesture.current = { type: "pan", point, start: current.current };
  };

  const panMove = (point: Point) => {
    const g = gesture.current;
    const metrics = measure();
    if (!metrics || g?.type !== "pan") return;
    const next = {
      scale: g.start.scale,
      x: g.start.x + point.x - g.point.x,
      y: g.start.y + point.y - g.point.y,
    };
    write(clamp(next, metrics), false);
  };

  const end = (): boolean => {
    const g = gesture.current;
    gesture.current = null;
    const metrics = measure();
    if (!config || !metrics || !g) return false;
    const { scale, x, y } = current.current;
    if (g.type === "pinch" && g.free && shouldCloseOnPinch(scale, g.peak, config.minScale)) {
      return true;
    }
    const settled = clampScale(scale, config.minScale, config.maxScale);
    if (Math.abs(settled - 1) < 0.01) commit(IDENTITY, true);
    else commit(clamp({ scale: settled, x, y }, metrics), true);
    return false;
  };

  return {
    targetRef,
    scale,
    isZoomed: () => current.current.scale > 1,
    zoomTo,
    zoomBy,
    toggle,
    reset,
    pinchStart,
    pinchMove,
    panStart,
    panMove,
    end,
  };
}
