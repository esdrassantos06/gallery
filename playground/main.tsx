import { StrictMode, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Icon, Lightbox, type LightboxProps, type Slide, type Transition } from "../src";
import "../src/styles.css";
import "./playground.css";
import { samples } from "./samples";

type Options = Pick<
  LightboxProps,
  | "transition"
  | "loop"
  | "preload"
  | "swipeThreshold"
  | "closeOnBackdropClick"
  | "keyboard"
  | "thumbnails"
  | "fullscreen"
> & { zoom: boolean; maxScale: number };

interface GalleryProps {
  title: string;
  description: ReactNode;
  slides: Slide[];
  lightbox?: Partial<LightboxProps>;
}

function Gallery({ title, description, slides, lightbox }: GalleryProps) {
  const [index, setIndex] = useState(-1);
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  const headingId = useId();
  return (
    <section className="pg-section" aria-labelledby={headingId}>
      <h2 id={headingId}>{title}</h2>
      <p className="pg-lede">{description}</p>
      <ul className="pg-grid">
        {slides.map((slide, i) => (
          <li key={slide.src}>
            <button
              type="button"
              className="pg-thumb"
              aria-label={`Open ${slide.alt?.split(":")[0] ?? `image ${i + 1}`}`}
              ref={(el) => {
                thumbnails.current[i] = el;
              }}
              onClick={() => setIndex(i)}
            >
              <img
                src={slide.thumbnail ?? slide.src}
                alt=""
                width={400}
                height={400}
                loading="lazy"
              />
            </button>
          </li>
        ))}
      </ul>
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

const mediaSlides: Slide[] = [
  {
    src: "/videos/sample-clip.mp4",
    poster: "/videos/sample-clip-poster.jpg",
    thumbnail: "/videos/sample-clip-poster.jpg",
    width: 1280,
    height: 720,
    alt: "Sample clip: drifting colour gradients",
    title: "Sample video · native player",
    description: "Generated locally with ffmpeg. WebM first, MP4 fallback, English captions.",
    sources: [
      { src: "/videos/sample-clip.webm", type: "video/webm" },
      { src: "/videos/sample-clip.mp4", type: "video/mp4" },
    ],
    tracks: [{ src: "/videos/sample-clip.en.vtt", srcLang: "en", label: "English", default: true }],
  },
  ...samples.slice(6, 9),
  {
    src: "/embed-demo.html",
    type: "iframe",
    width: 960,
    height: 600,
    title: "Embedded page · iframe slide",
    description: "Any page through type: iframe. YouTube and Vimeo links embed the same way.",
    thumbnail: "/samples/sample-12-thumb.jpg",
  },
  ...samples.slice(9, 11),
];

function SlideshowGallery() {
  const [interval, setSlideInterval] = useState(3000);
  const [autoplayVideo, setAutoplayVideo] = useState(false);
  return (
    <>
      <form
        className="pg-controls"
        aria-label="Slideshow options"
        onSubmit={(e) => e.preventDefault()}
      >
        <fieldset>
          <legend>Slideshow</legend>
          <label>
            Interval
            <input
              type="range"
              min={1000}
              max={8000}
              step={500}
              value={interval}
              onChange={(e) => setSlideInterval(Number(e.target.value))}
            />
            <output>{interval / 1000}s</output>
          </label>
          <label>
            <input
              type="checkbox"
              checked={autoplayVideo}
              onChange={(e) => setAutoplayVideo(e.target.checked)}
            />
            Autoplay video (muted)
          </label>
        </fieldset>
      </form>
      <Gallery
        title="Video and slideshow"
        description="A native video with captions, an iframe slide and images. Press the play button in the toolbar to run the slideshow; it pauses on manual navigation, while the tab is hidden and on video slides until the video ends."
        slides={mediaSlides}
        lightbox={{ slideshow: { interval }, video: { autoplay: autoplayVideo } }}
      />
    </>
  );
}

const ptLabels: LightboxProps["labels"] = {
  dialog: "Visualizador de imagens",
  close: "Fechar",
  previous: "Imagem anterior",
  next: "Imagem seguinte",
  counter: (current, total) => `${current} de ${total}`,
  announcement: (current, total, slide) => `Imagem ${current} de ${total}: ${slide.alt ?? ""}`,
};

const thinIcons: LightboxProps["icons"] = {
  previous: (
    <Icon>
      <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />
    </Icon>
  ),
  next: (
    <Icon>
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </Icon>
  ),
};

const brandTheme = {
  "--eg-background": "#101418",
  "--eg-color": "#f3efe6",
  "--eg-color-muted": "rgb(243 239 230 / 0.7)",
  "--eg-focus-color": "#f2b544",
  "--eg-arrow-background": "rgb(242 181 68 / 0.16)",
  "--eg-radius": "999px",
  "--eg-duration": "480ms",
} as CSSProperties;

function Controls({ value, onChange }: { value: Options; onChange: (next: Options) => void }) {
  const set = <K extends keyof Options>(key: K, next: Options[K]) =>
    onChange({ ...value, [key]: next });
  return (
    <form
      className="pg-controls"
      aria-label="Lightbox options"
      onSubmit={(e) => e.preventDefault()}
    >
      <fieldset>
        <legend>Transition</legend>
        {(["slide", "fade", "zoom"] as Transition[]).map((t) => (
          <label key={t}>
            <input
              type="radio"
              name="transition"
              value={t}
              checked={value.transition === t}
              onChange={() => set("transition", t)}
            />
            {t}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Behaviour</legend>
        <label>
          <input
            type="checkbox"
            checked={value.loop ?? true}
            onChange={(e) => set("loop", e.target.checked)}
          />
          Loop
        </label>
        <label>
          <input
            type="checkbox"
            checked={value.closeOnBackdropClick ?? true}
            onChange={(e) => set("closeOnBackdropClick", e.target.checked)}
          />
          Close on backdrop click
        </label>
        <label>
          <input
            type="checkbox"
            checked={value.keyboard ?? true}
            onChange={(e) => set("keyboard", e.target.checked)}
          />
          Keyboard
        </label>
      </fieldset>
      <fieldset>
        <legend>Viewer</legend>
        <label>
          <input
            type="checkbox"
            checked={value.thumbnails ?? true}
            onChange={(e) => set("thumbnails", e.target.checked)}
          />
          Thumbnails
        </label>
        <label>
          <input
            type="checkbox"
            checked={value.fullscreen ?? true}
            onChange={(e) => set("fullscreen", e.target.checked)}
          />
          Fullscreen
        </label>
        <label>
          <input
            type="checkbox"
            checked={value.zoom}
            onChange={(e) => set("zoom", e.target.checked)}
          />
          Zoom
        </label>
        <label>
          Max zoom
          <input
            type="number"
            min={1.5}
            max={8}
            step={0.5}
            value={value.maxScale}
            onChange={(e) => set("maxScale", Number(e.target.value))}
          />
        </label>
      </fieldset>
      <fieldset>
        <legend>Performance and gestures</legend>
        <label>
          Preload
          <input
            type="number"
            min={0}
            max={5}
            value={value.preload ?? 2}
            onChange={(e) => set("preload", Number(e.target.value))}
          />
        </label>
        <label>
          Swipe threshold
          <input
            type="range"
            min={20}
            max={200}
            step={10}
            value={value.swipeThreshold ?? 50}
            onChange={(e) => set("swipeThreshold", Number(e.target.value))}
          />
          <output>{value.swipeThreshold ?? 50}px</output>
        </label>
      </fieldset>
    </form>
  );
}

const usage = `import { Lightbox } from "@esdrassantos06/gallery";
import "@esdrassantos06/gallery/styles.css";

const [index, setIndex] = useState(-1);

<Lightbox
  slides={slides}
  open={index >= 0}
  index={Math.max(index, 0)}
  onIndexChange={setIndex}
  onClose={() => setIndex(-1)}
  getThumbnail={(i) => thumbnails.current[i]}
/>`;

function App() {
  const [options, setOptions] = useState<Options>({
    transition: "slide",
    loop: true,
    preload: 2,
    swipeThreshold: 50,
    closeOnBackdropClick: true,
    keyboard: true,
    thumbnails: true,
    fullscreen: true,
    zoom: true,
    maxScale: 3,
  });
  const { zoom, maxScale, ...rest } = options;
  return (
    <main className="pg-main">
      <header className="pg-header">
        <h1>@esdrassantos06/gallery</h1>
        <p className="pg-lede">
          Playground for the lightbox. Every image here is a generated sample, not a real photo.
          Resize the window or open it on a phone to check the responsive layout.
        </p>
      </header>
      <Controls value={options} onChange={setOptions} />
      <Gallery
        title="Default look"
        description="The built-in theme, driven by the options above."
        slides={samples}
        lightbox={{ ...rest, zoom: zoom && { maxScale } }}
      />
      <Gallery
        title="Customised"
        description="Portuguese labels, replaced arrow icons, a custom caption, an extra toolbar link and a brand theme set through --eg-* variables."
        slides={samples.slice(0, 6)}
        lightbox={{
          labels: ptLabels,
          icons: thinIcons,
          style: brandTheme,
          className: "pg-branded",
          render: {
            caption: (slide, i) => (
              <p className="pg-caption">
                <strong>{slide.title}</strong> · foto {i + 1}
              </p>
            ),
            toolbar: (buttons, slide) => (
              <>
                <a
                  className="eg-button pg-original"
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
      <SlideshowGallery />
      <section className="pg-section" aria-labelledby="usage">
        <h2 id="usage">Usage</h2>
        <pre className="pg-code">
          <code>{usage}</code>
        </pre>
      </section>
    </main>
  );
}

const root = document.getElementById("root");
if (root)
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
