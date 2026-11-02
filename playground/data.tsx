import type { CSSProperties } from "react";
import { Icon, type LightboxProps, type Slide } from "../src";
import { samples } from "./samples";

export { samples };

/** Video, iframe and image slides for the media gallery. */
export const mediaSlides: Slide[] = [
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

/** Portuguese labels for the customised gallery. */
export const ptLabels: LightboxProps["labels"] = {
  dialog: "Visualizador de imagens",
  close: "Fechar",
  previous: "Imagem anterior",
  next: "Imagem seguinte",
  counter: (current, total) => `${current} de ${total}`,
  announcement: (current, total, slide) => `Imagem ${current} de ${total}: ${slide.alt ?? ""}`,
};

/** Arrow icons drawn on the shared icon frame. */
export const thinIcons: LightboxProps["icons"] = {
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

/** A brand theme set only through --eg-* variables. */
export const brandTheme = {
  "--eg-background": "#101418",
  "--eg-color": "#f3efe6",
  "--eg-color-muted": "rgb(243 239 230 / 0.7)",
  "--eg-focus-color": "#f2b544",
  "--eg-arrow-background": "rgb(242 181 68 / 0.16)",
  "--eg-radius": "999px",
  "--eg-duration": "480ms",
} as CSSProperties;
