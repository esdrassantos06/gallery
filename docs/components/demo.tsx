"use client";
import { useRef, useState, type ReactNode } from "react";
import {
  Icon,
  Lightbox,
  previewOf,
  useLightboxHash,
  type LightboxProps,
  type RenderSlideProps,
  type Slide,
} from "../../src";
import { brandTheme, mediaSlides, ptLabels, samples, thinIcons } from "../../playground/data";

const videoSlide = mediaSlides[0] as Slide;

const slideSets = {
  images: samples,
  media: mediaSlides,
  player: [
    {
      ...videoSlide,
      type: "video",
      title: "Sample video · custom player",
      description: "A plain video element with one button, drawn by render.slide.",
    },
    ...samples.slice(0, 3),
  ],
} satisfies Record<string, Slide[]>;

function Player({ slide, width, height }: RenderSlideProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative" style={{ width, height }} data-eg-no-gestures>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- tracks come from slide.tracks */}
      <video
        ref={video}
        src={slide.src}
        poster={slide.poster}
        width={width}
        height={height}
        playsInline
        preload="metadata"
        aria-label={slide.alt}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="size-full bg-black object-contain"
      >
        {slide.tracks?.map((track) => (
          <track
            key={track.src}
            kind={track.kind ?? "captions"}
            src={track.src}
            srcLang={track.srcLang}
            label={track.label}
            default={track.default}
          />
        ))}
      </video>
      <button
        type="button"
        className="eg-button absolute bottom-3 left-3"
        style={{ background: "rgb(0 0 0 / 0.6)" }}
        aria-label={playing ? "Pause video" : "Play video"}
        onClick={() => {
          const el = video.current;
          if (!el) return;
          if (el.paused) void el.play();
          else el.pause();
        }}
      >
        <Icon>{playing ? <path d="M9 5v14M15 5v14" /> : <path d="M7 5l12 7-12 7z" />}</Icon>
      </button>
    </div>
  );
}

const presets = {
  none: {},
  i18n: { labels: ptLabels },
  icons: { icons: thinIcons },
  theme: { style: brandTheme },
  render: {
    render: {
      caption: (slide, i) => (
        <p className="m-0">
          <strong>{slide.title}</strong> · photo {i + 1}
        </p>
      ),
      counter: (current, total) => (
        <span>
          <b>{current}</b> of {total}
        </span>
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
  },
  customised: {
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
  },
  player: {
    slideshow: true,
    render: {
      slide: (props) => (props.slide.type === "video" ? <Player {...props} /> : undefined),
    },
  },
} satisfies Record<string, Partial<LightboxProps>>;

/** Lightbox props a demo can set: everything except its state and slides. */
export type DemoOptions = Omit<
  Partial<LightboxProps>,
  "slides" | "open" | "index" | "onClose" | "onIndexChange" | "getThumbnail"
>;

/** Props of {@link Demo}. Plain lightbox props pass straight through. */
export interface DemoProps extends DemoOptions {
  /** Which sample set to show. */
  set?: keyof typeof slideSets;
  /** How many slides of the set to show. */
  count?: number;
  /** Lightbox props that need functions, which MDX cannot pass to a client component. */
  preset?: keyof typeof presets;
}

/** Props of {@link Grid}. */
export interface GridProps extends DemoOptions {
  slides: Slide[];
  state: [number, (index: number) => void];
  /** Show the "Live demo" hint under the thumbnails. */
  hint?: boolean;
}

/** A square thumbnail grid wired to the lightbox. */
export function Grid({ slides, state: [index, setIndex], hint = true, ...options }: GridProps) {
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="not-prose bg-fd-card my-6 rounded-xl border p-3">
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(7.5rem,28vw),1fr))] gap-2">
        {slides.map((slide, i) => (
          <li key={slide.src}>
            <button
              type="button"
              className="bg-fd-muted group block w-full cursor-zoom-in overflow-hidden rounded-lg"
              aria-label={`Open ${typeof slide.title === "string" ? slide.title : `slide ${i + 1}`}`}
              ref={(el) => {
                thumbnails.current[i] = el;
              }}
              onClick={() => setIndex(i)}
            >
              <img
                src={previewOf(slide)}
                alt=""
                width={240}
                height={240}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover transition-opacity duration-200 group-hover:opacity-85"
              />
            </button>
          </li>
        ))}
      </ul>
      {hint && (
        <p className="text-fd-muted-foreground mt-3 px-1 text-xs">
          Live demo. Click a thumbnail to open it.
        </p>
      )}
      <Lightbox
        slides={slides}
        open={index >= 0}
        index={Math.max(index, 0)}
        onIndexChange={setIndex}
        onClose={() => setIndex(-1)}
        getThumbnail={(i) => thumbnails.current[i]}
        {...options}
      />
    </div>
  );
}

function resolve({ set = "images", count, preset = "none", ...options }: DemoProps) {
  const all = slideSets[set];
  return {
    slides: count === undefined ? all : all.slice(0, count),
    options: { ...presets[preset], ...options } as DemoOptions,
  };
}

/** A live gallery wired to the lightbox, for use inside MDX pages. */
export function Demo(props: DemoProps): ReactNode {
  const state = useState(-1);
  const { slides, options } = resolve(props);
  return <Grid slides={slides} state={state} {...options} />;
}

/** Props of {@link HashDemo}. */
export interface HashDemoProps extends DemoProps {
  /** Hash prefix, as in `#prefix-3`. */
  prefix: string;
}

/** {@link Demo} with its state kept in the URL hash by `useLightboxHash`. */
export function HashDemo({ prefix, ...props }: HashDemoProps): ReactNode {
  const { slides, options } = resolve(props);
  const state = useLightboxHash(prefix, { count: slides.length });
  return <Grid slides={slides} state={state} {...options} />;
}
