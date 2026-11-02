"use client";
import { useState } from "react";
import { useLightboxHash, type Transition } from "../../src";
import { mediaSlides, samples } from "../../playground/data";
import { Panel, Range, Segmented, Toggle } from "./controls";
import { Grid } from "./demo";

const transitions = ["slide", "fade", "zoom"] as const satisfies readonly Transition[];

/** The default gallery, driven by an options panel and kept in the URL as `#galeria-N`. */
export function PlaygroundGallery() {
  const [transition, setTransition] = useState<Transition>("slide");
  const [thumbnails, setThumbnails] = useState(true);
  const [zoom, setZoom] = useState(true);
  const [maxScale, setMaxScale] = useState(3);
  const [rotate, setRotate] = useState(true);
  const [download, setDownload] = useState(true);
  const [fullscreen, setFullscreen] = useState(true);
  const [loop, setLoop] = useState(true);
  const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(true);
  const [keyboard, setKeyboard] = useState(true);
  const [preload, setPreload] = useState(2);
  const [swipeThreshold, setSwipeThreshold] = useState(50);
  const state = useLightboxHash("galeria", { count: samples.length });

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
      <form
        aria-label="Lightbox options"
        className="bg-fd-card flex flex-col gap-6 rounded-xl border p-5 lg:sticky lg:top-20"
        onSubmit={(e) => e.preventDefault()}
      >
        <Panel title="Transition">
          <Segmented
            label="Transition"
            options={transitions}
            value={transition}
            onChange={setTransition}
          />
        </Panel>
        <Panel title="Viewer">
          <Toggle label="Thumbnails" checked={thumbnails} onChange={setThumbnails} />
          <Toggle label="Zoom" checked={zoom} onChange={setZoom} />
          <Toggle label="Rotate" checked={rotate} onChange={setRotate} />
          <Toggle label="Download" checked={download} onChange={setDownload} />
          <Toggle label="Fullscreen" checked={fullscreen} onChange={setFullscreen} />
          <Range
            label="Max zoom"
            value={maxScale}
            min={1.5}
            max={8}
            step={0.5}
            format={(v) => `${v}×`}
            onChange={setMaxScale}
          />
        </Panel>
        <Panel title="Behaviour">
          <Toggle label="Loop" checked={loop} onChange={setLoop} />
          <Toggle
            label="Close on backdrop click"
            checked={closeOnBackdropClick}
            onChange={setCloseOnBackdropClick}
          />
          <Toggle label="Keyboard" checked={keyboard} onChange={setKeyboard} />
          <Range
            label="Preload"
            value={preload}
            min={0}
            max={5}
            step={1}
            format={(v) => `${v} each side`}
            onChange={setPreload}
          />
          <Range
            label="Swipe threshold"
            value={swipeThreshold}
            min={20}
            max={200}
            step={10}
            format={(v) => `${v}px`}
            onChange={setSwipeThreshold}
          />
        </Panel>
      </form>
      <Grid
        slides={samples}
        state={state}
        hint={false}
        transition={transition}
        thumbnails={thumbnails}
        zoom={zoom && { maxScale }}
        rotate={rotate}
        download={download}
        fullscreen={fullscreen}
        loop={loop}
        closeOnBackdropClick={closeOnBackdropClick}
        keyboard={keyboard}
        preload={preload}
        swipeThreshold={swipeThreshold}
      />
    </div>
  );
}

/** Video, iframe and image slides with a slideshow, and its options. */
export function SlideshowGallery() {
  const [interval, setSlideInterval] = useState(3000);
  const [autoplay, setAutoplay] = useState(false);
  const state = useState(-1);
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
      <form
        aria-label="Slideshow options"
        className="bg-fd-card flex flex-col gap-2 rounded-xl border p-5"
        onSubmit={(e) => e.preventDefault()}
      >
        <Panel title="Slideshow">
          <Range
            label="Interval"
            value={interval}
            min={1000}
            max={8000}
            step={500}
            format={(v) => `${v / 1000}s`}
            onChange={setSlideInterval}
          />
          <Toggle label="Autoplay video (muted)" checked={autoplay} onChange={setAutoplay} />
        </Panel>
      </form>
      <Grid
        slides={mediaSlides}
        state={state}
        hint={false}
        slideshow={{ interval }}
        video={{ autoplay }}
      />
    </div>
  );
}
