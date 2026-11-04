import { StrictMode, useId, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Check, Copy, ExternalLink } from "lucide-react";
import {
  GalleryFilter,
  JustifiedGrid,
  Lightbox,
  MasonryGrid,
  previewOf,
  UniformGrid,
  useLightboxHash,
  type GridHandle,
  type GridProps,
  type LightboxProps,
  type Slide,
  type Transition,
} from "../src";
import "../src/styles.css";
import "./site.css";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { brandTheme, mediaSlides, ptLabels, samples, thinIcons } from "./data";

const REPO = "https://github.com/esdrassantos06/liftbox";
const NPM = "https://www.npmjs.com/package/liftbox";

interface Options {
  transition: Transition;
  loop: boolean;
  closeOnBackdropClick: boolean;
  keyboard: boolean;
  thumbnails: boolean;
  fullscreen: boolean;
  rotate: boolean;
  download: boolean;
  zoom: boolean;
  maxScale: number;
  preload: number;
  swipeThreshold: number;
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" className="fill-foreground" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-background">
        <rect
          x="17.8"
          y="25.8"
          width="20.5"
          height="20.5"
          rx="2.5"
          strokeWidth="2.5"
          strokeOpacity=".38"
        />
        <rect x="25" y="11" width="28" height="28" rx="3.4" strokeWidth="3.5" />
      </g>
      <rect x="10.5" y="40.5" width="13" height="13" rx="2" className="fill-background" />
    </svg>
  );
}

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-3 rounded-md" aria-label="liftbox, home">
      <LogoMark className="size-9" />
      <span className="flex flex-col leading-none" aria-hidden="true">
        <span className="text-xl font-[650] tracking-[-0.02em]">liftbox</span>
        <span className="text-muted-foreground mt-1 text-xs font-medium">playground</span>
      </span>
    </a>
  );
}

function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-card flex min-h-12 items-center gap-2 rounded-lg border py-1 pr-1 pl-4 font-mono text-sm">
      <span className="text-muted-foreground select-none" aria-hidden="true">
        $
      </span>
      <code className="flex-1 overflow-x-auto whitespace-nowrap">{command}</code>
      <Button
        variant="ghost"
        size="icon"
        className="size-10"
        aria-label={copied ? "Copied" : "Copy install command"}
        onClick={() => {
          void navigator.clipboard?.writeText(command).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          });
        }}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <output className="text-muted-foreground font-mono text-xs tabular-nums">
          {format(value)}
        </output>
      </div>
      <Slider
        thumbLabel={label}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => {
          if (next !== undefined) onChange(next);
        }}
      />
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Controls({ value, onChange }: { value: Options; onChange: (next: Options) => void }) {
  const set = <K extends keyof Options>(key: K, next: Options[K]) =>
    onChange({ ...value, [key]: next });
  return (
    <form
      aria-label="Lightbox options"
      className="bg-card flex flex-col gap-6 rounded-xl border p-5"
      onSubmit={(e) => e.preventDefault()}
    >
      <Panel title="Transition">
        <RadioGroup
          value={value.transition}
          onValueChange={(next) => set("transition", next as Transition)}
          className="grid grid-cols-3 gap-2"
        >
          {(["slide", "fade", "zoom"] as Transition[]).map((t) => (
            <Label
              key={t}
              className="has-data-[state=checked]:border-foreground flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 font-normal capitalize"
            >
              <RadioGroupItem value={t} aria-label={t} />
              {t}
            </Label>
          ))}
        </RadioGroup>
      </Panel>
      <Separator />
      <Panel title="Viewer">
        <ToggleField
          label="Thumbnails"
          checked={value.thumbnails}
          onChange={(v) => set("thumbnails", v)}
        />
        <ToggleField label="Zoom" checked={value.zoom} onChange={(v) => set("zoom", v)} />
        <ToggleField label="Rotate" checked={value.rotate} onChange={(v) => set("rotate", v)} />
        <ToggleField
          label="Download"
          checked={value.download}
          onChange={(v) => set("download", v)}
        />
        <ToggleField
          label="Fullscreen"
          checked={value.fullscreen}
          onChange={(v) => set("fullscreen", v)}
        />
        <SliderField
          label="Max zoom"
          value={value.maxScale}
          min={1.5}
          max={8}
          step={0.5}
          format={(v) => `${v}×`}
          onChange={(v) => set("maxScale", v)}
        />
      </Panel>
      <Separator />
      <Panel title="Behaviour">
        <ToggleField label="Loop" checked={value.loop} onChange={(v) => set("loop", v)} />
        <ToggleField
          label="Close on backdrop click"
          checked={value.closeOnBackdropClick}
          onChange={(v) => set("closeOnBackdropClick", v)}
        />
        <ToggleField
          label="Keyboard"
          checked={value.keyboard}
          onChange={(v) => set("keyboard", v)}
        />
        <SliderField
          label="Preload"
          value={value.preload}
          min={0}
          max={5}
          step={1}
          format={(v) => `${v} each side`}
          onChange={(v) => set("preload", v)}
        />
        <SliderField
          label="Swipe threshold"
          value={value.swipeThreshold}
          min={20}
          max={200}
          step={10}
          format={(v) => `${v}px`}
          onChange={(v) => set("swipeThreshold", v)}
        />
      </Panel>
    </form>
  );
}

interface GalleryProps {
  title: string;
  description: ReactNode;
  slides: Slide[];
  lightbox?: Partial<LightboxProps>;
  state?: [number, (index: number) => void];
  aside?: ReactNode;
}

function Gallery({ title, description, slides, lightbox, state, aside }: GalleryProps) {
  const local = useState(-1);
  const [index, setIndex] = state ?? local;
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  const headingId = useId();
  const grid = (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(9rem,40vw),1fr))] gap-2">
      {slides.map((slide, i) => (
        <li key={slide.src}>
          <button
            type="button"
            className="bg-muted group block w-full cursor-zoom-in overflow-hidden rounded-lg"
            aria-label={`Open ${slide.alt?.split(":")[0] ?? `image ${i + 1}`}`}
            ref={(el) => {
              thumbnails.current[i] = el;
            }}
            onClick={() => setIndex(i)}
          >
            <img
              src={previewOf(slide)}
              alt=""
              width={400}
              height={400}
              loading="lazy"
              decoding="async"
              className="aspect-square w-full object-cover transition-opacity duration-200 group-hover:opacity-85"
            />
          </button>
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-labelledby={headingId} className="scroll-mt-8 py-16">
      <div className="mb-8 max-w-2xl">
        <h2 id={headingId} className="text-2xl font-semibold tracking-[-0.02em] text-balance">
          {title}
        </h2>
        <p className="text-muted-foreground mt-2 text-pretty">{description}</p>
      </div>
      {aside ? (
        <div className="grid items-start gap-8 lg:grid-cols-[18rem_1fr]">
          <div className="lg:sticky lg:top-6">{aside}</div>
          {grid}
        </div>
      ) : (
        grid
      )}
      <Lightbox
        slides={slides}
        open={index >= 0}
        index={Math.max(index, 0)}
        onIndexChange={setIndex}
        onClose={() => setIndex(-1)}
        getThumbnail={(i) => thumbnails.current[i]}
        {...lightbox}
      />
    </section>
  );
}

function SlideshowGallery() {
  const [interval, setSlideInterval] = useState(3000);
  const [autoplayVideo, setAutoplayVideo] = useState(false);
  return (
    <Gallery
      title="Video and slideshow"
      description="A native video with captions, an iframe slide and images. Press play in the toolbar to run the slideshow; it pauses on manual navigation, while the tab is hidden and on video slides until the video ends."
      slides={mediaSlides}
      lightbox={{ slideshow: { interval }, video: { autoplay: autoplayVideo } }}
      aside={
        <form
          aria-label="Slideshow options"
          className="bg-card flex flex-col gap-2 rounded-xl border p-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <Panel title="Slideshow">
            <SliderField
              label="Interval"
              value={interval}
              min={1000}
              max={8000}
              step={500}
              format={(v) => `${v / 1000}s`}
              onChange={setSlideInterval}
            />
            <ToggleField
              label="Autoplay video (muted)"
              checked={autoplayVideo}
              onChange={setAutoplayVideo}
            />
          </Panel>
        </form>
      }
    />
  );
}

function PolishGallery() {
  const [polish, setPolish] = useState({
    flip: true,
    share: true,
    pager: true,
    thumbnails: false,
    idle: false,
    rtl: false,
    pinchToClose: true,
    captionInSlide: false,
  });
  const set = (key: keyof typeof polish) => (value: boolean) =>
    setPolish((prev) => ({ ...prev, [key]: value }));
  const { rtl, idle, captionInSlide, ...flags } = polish;
  return (
    <Gallery
      title="Interaction polish"
      description="Flip, share and every other button: on a narrow screen the ones that do not fit move into a More menu, zoom first. Pager dots, controls that fade out when idle, right-to-left, pinch to close and captions laid over the image are each one prop."
      slides={samples}
      lightbox={{
        ...flags,
        rotate: true,
        download: true,
        idle: idle && 2000,
        dir: rtl ? "rtl" : "ltr",
        captionPosition: captionInSlide ? "slide" : "bar",
      }}
      aside={
        <form
          aria-label="Polish options"
          className="bg-card flex flex-col gap-2 rounded-xl border p-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <Panel title="Polish">
            <ToggleField label="Flip buttons" checked={polish.flip} onChange={set("flip")} />
            <ToggleField label="Share button" checked={polish.share} onChange={set("share")} />
            <ToggleField label="Pager dots" checked={polish.pager} onChange={set("pager")} />
            <ToggleField
              label="Thumbnail strip"
              checked={polish.thumbnails}
              onChange={set("thumbnails")}
            />
            <ToggleField label="Hide controls when idle" checked={idle} onChange={set("idle")} />
            <ToggleField label="Right to left" checked={rtl} onChange={set("rtl")} />
            <ToggleField
              label="Pinch to close"
              checked={polish.pinchToClose}
              onChange={set("pinchToClose")}
            />
            <ToggleField
              label="Caption inside the slide"
              checked={captionInSlide}
              onChange={set("captionInSlide")}
            />
          </Panel>
        </form>
      }
    />
  );
}

type Layout = "justified" | "masonry" | "uniform";
type Shape = "Landscape" | "Portrait" | "Square";

const shapes: Shape[] = ["Landscape", "Portrait", "Square"];

function shapeOf(slide: Slide): Shape {
  const ratio = (slide.width ?? 1) / (slide.height ?? 1);
  return ratio > 1.05 ? "Landscape" : ratio < 0.95 ? "Portrait" : "Square";
}

function GridsGallery() {
  const [layout, setLayout] = useState<Layout>("justified");
  const [shape, setShape] = useState<Shape | null>(null);
  const [index, setIndex] = useState(-1);
  const grid = useRef<GridHandle>(null);
  const headingId = useId();
  const shown = shape ? samples.filter((slide) => shapeOf(slide) === shape) : samples;
  const props: GridProps = {
    slides: shown,
    onOpen: setIndex,
    labels: { open: (i, _total, slide) => `Open ${slide.alt?.split(":")[0] ?? `image ${i}`}` },
  };
  return (
    <section aria-labelledby={headingId} className="scroll-mt-8 py-16">
      <div className="mb-8 max-w-2xl">
        <h2 id={headingId} className="text-2xl font-semibold tracking-[-0.02em] text-balance">
          Grids and filter
        </h2>
        <p className="text-muted-foreground mt-2 text-pretty">
          Justified rows, masonry columns or uniform cells, with a category filter. The grids work
          without the lightbox and the lightbox works without them; here they share the filtered
          list, so indices always match.
        </p>
      </div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <GalleryFilter
          categories={shapes}
          value={shape}
          onChange={setShape}
          count={shown.length}
          labels={{ group: "Filter by shape" }}
        />
        <RadioGroup
          aria-label="Layout"
          value={layout}
          onValueChange={(next) => setLayout(next as Layout)}
          className="grid grid-cols-3 gap-2"
        >
          {(["justified", "masonry", "uniform"] as Layout[]).map((l) => (
            <Label
              key={l}
              className="has-data-[state=checked]:border-foreground flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 font-normal capitalize"
            >
              <RadioGroupItem value={l} aria-label={l} />
              {l}
            </Label>
          ))}
        </RadioGroup>
      </div>
      {layout === "justified" ? (
        <JustifiedGrid ref={grid} {...props} rowHeight={(w) => (w < 640 ? 140 : 220)} />
      ) : layout === "masonry" ? (
        <MasonryGrid ref={grid} {...props} />
      ) : (
        <UniformGrid ref={grid} {...props} aspectRatio={4 / 3} />
      )}
      <Lightbox
        slides={shown}
        open={index >= 0}
        index={Math.max(index, 0)}
        onIndexChange={setIndex}
        onClose={() => setIndex(-1)}
        getThumbnail={(i) => grid.current?.getThumbnail(i)}
      />
    </section>
  );
}

const usage = `import { Lightbox, useLightboxHash } from "liftbox";
import "liftbox/styles.css";

export function Gallery({ slides }) {
  const thumbnails = useRef([]);
  const [index, setIndex] = useLightboxHash("galeria", { count: slides.length });

  return (
    <>
      {slides.map((slide, i) => (
        <button key={slide.src} ref={(el) => (thumbnails.current[i] = el)} onClick={() => setIndex(i)}>
          <img src={slide.thumbnail} alt={slide.alt} />
        </button>
      ))}
      <Lightbox
        slides={slides}
        open={index >= 0}
        index={Math.max(index, 0)}
        onIndexChange={setIndex}
        onClose={() => setIndex(-1)}
        getThumbnail={(i) => thumbnails.current[i]}
      />
    </>
  );
}`;

const facts = [
  ["11.6 kB", "min + brotli, measured"],
  ["0", "runtime dependencies"],
  ["React 18 and 19", "SSR safe, App Router ready"],
  ["WCAG 2.2 AA", "focus trap, live region, reduced motion"],
] as const;

function App() {
  const [options, setOptions] = useState<Options>({
    transition: "slide",
    loop: true,
    closeOnBackdropClick: true,
    keyboard: true,
    thumbnails: true,
    fullscreen: true,
    rotate: true,
    download: true,
    zoom: true,
    maxScale: 3,
    preload: 2,
    swipeThreshold: 50,
  });
  const { zoom, maxScale, ...rest } = options;
  const hashState = useLightboxHash("galeria", { count: samples.length });

  return (
    <>
      <a
        href="#demo"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to the demo
      </a>
      <div id="top" className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="flex items-center justify-between gap-4 py-6">
          <Logo />
          <nav aria-label="Main" className="flex items-center gap-1 text-sm">
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <a href="#demo">Demo</a>
            </Button>
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <a href="#usage">Usage</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href={REPO} target="_blank" rel="noreferrer">
                GitHub
                <ExternalLink aria-hidden="true" />
              </a>
            </Button>
          </nav>
        </header>

        <main>
          <section
            aria-labelledby="hero"
            className="grid gap-10 py-12 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-end"
          >
            <div>
              <h1
                id="hero"
                className="max-w-[16ch] text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-6xl"
              >
                A lightbox that flies out of your thumbnails.
              </h1>
              <p className="text-muted-foreground mt-6 max-w-[56ch] text-lg text-pretty">
                Accessible React gallery viewer with zoom, video, slideshow and deep links. Every
                string, icon and color is yours to replace, and it ships without a single runtime
                dependency.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" asChild>
                  <a href="#demo">Try the demo</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href={NPM} target="_blank" rel="noreferrer">
                    View on npm
                  </a>
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <CopyCommand command="npm install liftbox" />
              <dl className="bg-border grid grid-cols-2 gap-px overflow-hidden rounded-xl border">
                {facts.map(([value, label]) => (
                  <div key={label} className="bg-card p-4">
                    <dt className="text-muted-foreground text-xs">{label}</dt>
                    <dd className="mt-1 font-semibold tracking-tight">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <Separator />

          <div id="demo" className="scroll-mt-4">
            <Gallery
              title="Default look"
              description="The built-in theme, driven by the options beside it. The open photo is kept in the URL as #galeria-3, so you can share it, and the back button closes the viewer."
              slides={samples}
              state={hashState}
              lightbox={{ ...rest, zoom: zoom && { maxScale } }}
              aside={<Controls value={options} onChange={setOptions} />}
            />
          </div>

          <Separator />

          <Gallery
            title="Customised"
            description="Portuguese labels, replaced arrow icons, a custom caption, an extra toolbar link and a brand theme set only through --eg-* variables."
            slides={samples.slice(0, 6)}
            lightbox={{
              labels: ptLabels,
              icons: thinIcons,
              style: brandTheme,
              render: {
                caption: (slide, i) => (
                  <p className="m-0">
                    <strong>{slide.title}</strong> · foto {i + 1}
                  </p>
                ),
                toolbar: (buttons, slide) => (
                  <>
                    <a
                      className="eg-button w-auto px-3 no-underline"
                      href={slide.src}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Original
                    </a>
                    {buttons}
                  </>
                ),
              },
            }}
          />

          <Separator />

          <SlideshowGallery />

          <Separator />

          <PolishGallery />

          <Separator />

          <GridsGallery />

          <Separator />

          <section aria-labelledby="usage" className="scroll-mt-8 py-16">
            <h2 id="usage" className="text-2xl font-semibold tracking-[-0.02em]">
              Usage
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Keep the lightbox mounted next to your grid and drive it with an index. The full API
              is in the README.
            </p>
            <pre className="bg-foreground text-background mt-8 overflow-x-auto rounded-xl p-5 font-mono text-[0.8125rem] leading-relaxed">
              <code>{usage}</code>
            </pre>
          </section>
        </main>

        <footer className="text-muted-foreground flex flex-wrap items-center justify-between gap-4 border-t py-8 text-sm">
          <div className="flex items-center gap-3">
            <LogoMark className="size-6" />
            <span>MIT licensed. Sample images and video are generated, not real photos.</span>
          </div>
          <a
            href={REPO}
            className="hover:text-foreground underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            esdrassantos06/liftbox
          </a>
        </footer>
      </div>
    </>
  );
}

const root = document.getElementById("root");
if (root)
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
