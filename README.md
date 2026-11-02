<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/logo/logo-dark.svg" />
    <img src="./assets/logo/logo-light.svg" alt="@esdrassantos06/gallery" width="280" />
  </picture>
</p>

# @esdrassantos06/gallery

[![CI](https://github.com/esdrassantos06/gallery/actions/workflows/ci.yml/badge.svg)](https://github.com/esdrassantos06/gallery/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@esdrassantos06/gallery)](https://www.npmjs.com/package/@esdrassantos06/gallery)
[![License: MIT](https://img.shields.io/badge/license-MIT-black)](./LICENSE)

**[Live demo](https://gallery-esdrassantos06.vercel.app)**

An accessible, themeable image lightbox for React. It has zero runtime dependencies, works with any grid, and every string, icon, color, size and timing can be replaced.

> **Status:** version 1.0.0, phase 4 of 7. The core lightbox, thumbnails, zoom, fullscreen, video and embeds, slideshow, deep linking, rotation and download described below are implemented and tested. The optional grids, interaction polish and release tooling are planned and **not available yet** (see [Roadmap](#roadmap)).

## Contents

- [Features](#features)
- [Installation](#installation)
- [Compatibility](#compatibility)
- [Quick start](#quick-start)
- [Next.js (App Router)](#nextjs-app-router)
- [API](#api)
- [Labels and translations](#labels-and-translations)
- [Icons](#icons)
- [Render overrides](#render-overrides)
- [Styling](#styling)
- [Transitions](#transitions)
- [Navigation and keyboard](#navigation-and-keyboard)
- [Gestures](#gestures)
- [Thumbnails](#thumbnails)
- [Zoom](#zoom)
- [Fullscreen](#fullscreen)
- [Loading and errors](#loading-and-errors)
- [Video and embeds](#video-and-embeds)
- [Slideshow](#slideshow)
- [Custom players (Video.js, Plyr, Mux…)](#custom-players-videojs-plyr-mux)
- [Deep linking](#deep-linking)
- [Rotation](#rotation)
- [Download](#download)
- [Accessibility](#accessibility)
- [Content Security Policy](#content-security-policy)
- [Performance](#performance)
- [Bundle size](#bundle-size)
- [Site and playground](#site-and-playground)
- [Roadmap](#roadmap)
- [License](#license)

## Features

- Opens from the thumbnail and closes back into it (FLIP, Web Animations API, uniform scale).
- Zoom-and-fade fallback when there is no thumbnail to start from.
- Previous and next arrows, keyboard navigation, optional looping.
- Swipe sideways to change slide and swipe down to close, with flick detection.
- `slide`, `fade` and `zoom` transitions, all on `transform` and `opacity` only.
- Counter, title and description, each replaceable through render props.
- Thumbnail strip that follows the current slide and scrolls natively.
- Zoom with the wheel, trackpad pinch, double click, double tap, touch pinch, buttons and keys, anchored to the pointer, with panning that keeps the image covering the stage.
- Fullscreen through the Fullscreen API, kept in sync with changes made by the browser.
- Loading indicator and an error message for images that fail.
- Native video with posters, multiple sources and caption tracks; YouTube through `youtube-nocookie.com` and Vimeo with Do Not Track, both without player scripts; any page in an iframe.
- Slideshow with a progress bar that pauses on manual navigation, while the page is hidden and on video slides.
- Deep links through the URL hash (`#galeria-3`) with back-button close and exact URL restore.
- Rotation in quarter turns that keeps fitting and zoom correct.
- Downloads that keep the file name across origins and fall back to a new tab when the server refuses.
- Only the current slide and a configurable number of neighbors are mounted, so nothing else loads.
- `srcset` and `sizes`, explicit image dimensions, and one `ResizeObserver`.
- Modal dialog semantics, focus trap, focus return, a polite live region and scroll lock that keeps the page from shifting.
- `prefers-reduced-motion` disables every animation.
- Server-rendering safe, ships `"use client"`.
- Styled with `--eg-*` CSS variables and `eg-*` class names.

## Installation

```bash
npm install @esdrassantos06/gallery
```

Import the stylesheet once, anywhere in your app:

```ts
import "@esdrassantos06/gallery/styles.css";
```

## Compatibility

|               | Supported                                                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React         | 18 and 19 (peer dependency)                                                                                                                                                       |
| Module format | ESM only, with TypeScript declarations                                                                                                                                            |
| Frameworks    | Any React setup, including the Next.js App Router                                                                                                                                 |
| Browsers      | Current evergreen browsers. Where `ResizeObserver` or the Web Animations API are missing, the lightbox falls back to window resize events and opens without the flight animation. |

## Quick start

The lightbox is controlled: you own `open` and `index`, it tells you when the user wants to change them. Keep it mounted so the close animation can play.

```tsx
import { useRef, useState } from "react";
import { Lightbox, type Slide } from "@esdrassantos06/gallery";
import "@esdrassantos06/gallery/styles.css";

const slides: Slide[] = [
  {
    src: "/photos/harbour-1600.jpg",
    srcSet: "/photos/harbour-640.jpg 640w, /photos/harbour-1600.jpg 1600w",
    width: 1600,
    height: 1067,
    alt: "Fishing boats in the harbour at dusk",
    title: "Harbour",
    description: "Porto, 2026",
  },
  // ...
];

export function Gallery() {
  const [index, setIndex] = useState(-1);
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <>
      {slides.map((slide, i) => (
        <button
          key={slide.src}
          ref={(el) => {
            thumbnails.current[i] = el;
          }}
          onClick={() => setIndex(i)}
          aria-label={`Open ${slide.alt}`}
        >
          <img src={slide.src} alt="" width={200} height={133} />
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
}
```

Passing `width` and `height` is optional but recommended: the image is then sized before it loads (no layout shift) and the open animation lands exactly.

## Next.js (App Router)

The bundle starts with `"use client"`, so you can import it from a Server Component file tree without a wrapper. It does not touch `window` or `document` while rendering; the dialog is portalled only after hydration. You do not need `dynamic(() => import(...), { ssr: false })`.

```tsx
// app/gallery.tsx
"use client";
import { Lightbox } from "@esdrassantos06/gallery";
```

Import `@esdrassantos06/gallery/styles.css` in `app/layout.tsx` or in the client component.

## API

### `<Lightbox />`

| Prop                   | Type                                                  | Default         | Description                                                                                                                                           |
| ---------------------- | ----------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slides`               | `Slide[]`                                             | required        | Items to show, in order.                                                                                                                              |
| `open`                 | `boolean`                                             | required        | Whether the lightbox is shown. Setting it to `false` plays the exit animation before unmounting.                                                      |
| `onClose`              | `() => void`                                          | required        | Called when the user asks to close (Escape, close button, backdrop click, downward swipe). Set `open` to `false` in response.                         |
| `index`                | `number`                                              | `0`             | Current slide. Read when opening and whenever it changes while open.                                                                                  |
| `onIndexChange`        | `(index: number) => void`                             |                 | Called with the new index whenever the user changes slide.                                                                                            |
| `onAfterOpen`          | `() => void`                                          |                 | Called once the open animation has finished.                                                                                                          |
| `onAfterClose`         | `() => void`                                          |                 | Called once the close animation has finished and focus was returned.                                                                                  |
| `loop`                 | `boolean`                                             | `true`          | Wrap from the last slide to the first and back. When `false`, the arrows are disabled at the ends.                                                    |
| `transition`           | `"slide" \| "fade" \| "zoom"`                         | `"slide"`       | Slide change animation.                                                                                                                               |
| `preload`              | `number`                                              | `2`             | Slides mounted (and loaded) on each side of the current one.                                                                                          |
| `closeOnBackdropClick` | `boolean`                                             | `true`          | Close when the empty area around the image is clicked.                                                                                                |
| `swipe`                | `boolean`                                             | `true`          | Swipe or drag sideways to change slide, up or down to close.                                                                                          |
| `swipeThreshold`       | `number`                                              | `50`            | Horizontal travel in px that changes slide. Quick flicks need less.                                                                                   |
| `keyboard`             | `boolean`                                             | `true`          | Arrow keys, Home and End navigate; Escape closes; `+`, `-` and `0` zoom.                                                                              |
| `thumbnails`           | `boolean`                                             | `true`          | Show the thumbnail strip (only when there is more than one slide).                                                                                    |
| `zoom`                 | `boolean \| ZoomOptions`                              | `true`          | Zoom with wheel, double click or tap, pinch, buttons and keys. See [Zoom](#zoom).                                                                     |
| `fullscreen`           | `boolean`                                             | `true`          | Show a fullscreen button where the Fullscreen API is available.                                                                                       |
| `video`                | `VideoOptions`                                        |                 | `{ autoplay }`: start the current video or embed, muted. See [Video and embeds](#video-and-embeds).                                                   |
| `slideshow`            | `boolean \| SlideshowOptions`                         | `false`         | Add a slideshow button. See [Slideshow](#slideshow).                                                                                                  |
| `rotate`               | `boolean`                                             | `false`         | Add rotate left and right buttons for images. See [Rotation](#rotation).                                                                              |
| `download`             | `boolean \| DownloadOptions`                          | `false`         | Add a download button for images and video files. See [Download](#download).                                                                          |
| `getThumbnail`         | `(index: number) => HTMLElement \| null \| undefined` |                 | Element that opened a slide. Animations start and end there and focus returns to it. Without it, focus returns to the element focused before opening. |
| `labels`               | `Partial<LightboxLabels>`                             | English         | See [Labels](#labels-and-translations).                                                                                                               |
| `icons`                | `Partial<LightboxIcons>`                              | built-in        | See [Icons](#icons).                                                                                                                                  |
| `classNames`           | `Partial<LightboxClassNames>`                         |                 | Extra classes per part, next to the `eg-*` ones.                                                                                                      |
| `render`               | `LightboxRender`                                      |                 | See [Render overrides](#render-overrides).                                                                                                            |
| `className`            | `string`                                              |                 | Extra class on the root element.                                                                                                                      |
| `style`                | `CSSProperties`                                       |                 | Inline style on the root element, handy for `--eg-*` variables.                                                                                       |
| `container`            | `HTMLElement \| null`                                 | `document.body` | Element the dialog is portalled into.                                                                                                                 |

### `Slide`

| Field             | Type                                         | Description                                                                                                      |
| ----------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `src`             | `string`                                     | Image, video file, YouTube or Vimeo link, or a page with `type: "iframe"`.                                       |
| `type`            | `"image" \| "video" \| "iframe"`             | How the slide renders. Detected from `src` when omitted.                                                         |
| `poster`          | `string`                                     | Still image for a video, and for embeds on neighboring slides.                                                   |
| `sources`         | `{ src, type? }[]`                           | Alternative video files, in order of preference.                                                                 |
| `tracks`          | `{ src, srcLang, label, kind?, default? }[]` | Captions, subtitles or descriptions for a video. `kind` defaults to `captions`.                                  |
| `download`        | `string \| false`                            | URL the download button saves instead of `src`, or `false` to hide the button on this slide.                     |
| `downloadName`    | `string`                                     | File name for the download.                                                                                      |
| `srcSet`          | `string`                                     | Responsive candidates for `<img srcset>`.                                                                        |
| `sizes`           | `string`                                     | `<img sizes>` when `srcSet` is set. Defaults to the width the image is rendered at, in px.                       |
| `width`, `height` | `number`                                     | Natural size in px. Recommended.                                                                                 |
| `alt`             | `string`                                     | Alternative text.                                                                                                |
| `title`           | `ReactNode`                                  | Caption heading (`h2`).                                                                                          |
| `description`     | `ReactNode`                                  | Caption text.                                                                                                    |
| `thumbnail`       | `string`                                     | Preview image for the thumbnail strip. Falls back to `src`, which downloads the full image, so pass a small one. |

### `LightboxClassNames` parts

`root`, `backdrop`, `topBar`, `counter`, `toolbar`, `button`, `arrow`, `stage`, `slide`, `image`, `caption`, `thumbnails`, `thumbnail`, `video`, `embed`, `progress`.

### Other exports

| Export                                           | Description                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultLabels`                                  | The English labels, to extend instead of rewriting.                                                                                                                                                                                                                                            |
| `defaultIcons`                                   | The built-in icons.                                                                                                                                                                                                                                                                            |
| `Icon`                                           | The SVG base used by the built-in icons (24 × 24 grid, 1.5px stroke, `currentColor`). Use it to draw matching icons.                                                                                                                                                                           |
| `fitContain(width, height, boxWidth, boxHeight)` | The fit math the lightbox uses: scales a size into a box without upscaling.                                                                                                                                                                                                                    |
| `getMedia(slide, { autoplay? })`                 | How a slide renders: `image`, `video`, `youtube`, `vimeo` or `iframe`, with the embed URL.                                                                                                                                                                                                     |
| `useLightboxHash(prefix, { count? })`            | `[index, setIndex]` kept in the URL hash. See [Deep linking](#deep-linking).                                                                                                                                                                                                                   |
| Types                                            | `Slide`, `VideoSource`, `VideoTrack`, `Transition`, `ZoomOptions`, `VideoOptions`, `SlideshowOptions`, `DownloadOptions`, `LightboxHashOptions`, `LightboxProps`, `LightboxLabels`, `LightboxIcons`, `LightboxClassNames`, `LightboxRender`, `RenderSlideProps`, `Media`, `MediaKind`, `Size`. |

## Labels and translations

Every visible or announced string comes from `labels`. Pass only the ones you want to change.

```tsx
<Lightbox
  labels={{
    dialog: "Visualizador de imagens",
    close: "Fechar",
    previous: "Imagem anterior",
    next: "Imagem seguinte",
    counter: (current, total) => `${current} de ${total}`,
    announcement: (current, total, slide) => `Imagem ${current} de ${total}: ${slide.alt ?? ""}`,
  }}
  {...props}
/>
```

With `next-intl`, build the object from your messages:

```tsx
const t = useTranslations("lightbox");
const labels = {
  dialog: t("dialog"),
  close: t("close"),
  previous: t("previous"),
  next: t("next"),
  counter: (current: number, total: number) => t("counter", { current, total }),
  announcement: (current: number, total: number) => t("announcement", { current, total }),
};
```

| Key                                   | Default                                                              |
| ------------------------------------- | -------------------------------------------------------------------- |
| `dialog`                              | `Image viewer`                                                       |
| `close`                               | `Close`                                                              |
| `previous`                            | `Previous image`                                                     |
| `next`                                | `Next image`                                                         |
| `counter(current, total)`             | `3 / 12`                                                             |
| `announcement(current, total, slide)` | `Image 3 of 12: <title or alt>`                                      |
| `thumbnails`                          | `Thumbnails`                                                         |
| `thumbnail(index, total, slide)`      | `Show image 3`                                                       |
| `zoomIn`                              | `Zoom in`                                                            |
| `zoomOut`                             | `Zoom out`                                                           |
| `enterFullscreen`                     | `Enter fullscreen`                                                   |
| `exitFullscreen`                      | `Exit fullscreen`                                                    |
| `loadError`                           | `This image could not be loaded.`                                    |
| `playSlideshow`                       | `Start slideshow`                                                    |
| `pauseSlideshow`                      | `Pause slideshow`                                                    |
| `video`                               | `Video`                                                              |
| `rotateLeft`                          | `Rotate left`                                                        |
| `rotateRight`                         | `Rotate right`                                                       |
| `download`                            | `Download`                                                           |
| `downloadError`                       | `This file could not be downloaded here, so it opened in a new tab.` |

## Icons

The built-in icons are drawn for this package: 24 × 24, 1.5px round stroke, `currentColor`. Replace any of them with any React node: `close`, `previous`, `next`, `zoomIn`, `zoomOut`, `enterFullscreen`, `exitFullscreen`, `playSlideshow`, `pauseSlideshow`, `rotateLeft`, `rotateRight` and `download`. The `Icon` export gives you the same frame:

```tsx
import { Icon, Lightbox } from "@esdrassantos06/gallery";

<Lightbox
  icons={{
    previous: (
      <Icon>
        <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />
      </Icon>
    ),
    close: <MyCloseIcon aria-hidden="true" />,
  }}
  {...props}
/>;
```

Buttons keep their `aria-label` from `labels`, so icons should be decorative (`aria-hidden`).

## Render overrides

```tsx
<Lightbox
  render={{
    caption: (slide, index) => (
      <p>
        {slide.title} · {index + 1}
      </p>
    ), // return null to hide
    counter: (current, total) => <b>{current}</b>,
    toolbar: (buttons, slide) => (
      <>
        <a className="eg-button" href={slide.src} download>
          Download
        </a>
        {buttons}
      </>
    ),
    slide: ({ slide, width, height }) =>
      slide.src.endsWith(".svg") ? (
        <img src={slide.src} width={width} height={height} alt="" />
      ) : undefined,
  }}
  {...props}
/>
```

- `render.slide` returns `undefined` to keep the built-in image.
- `render.toolbar` receives the built-in buttons (slideshow when enabled; zoom, rotate and download on images when enabled; fullscreen when available; close) plus the current slide and index.
- `render.thumbnail` replaces the content of each thumbnail button; the button and its label stay.

## Styling

The lightbox is neutral by default: black backdrop, counter top left, toolbar top right, caption at the bottom. Restyle it with CSS variables on `.eg-root`, on any ancestor, or through `style`:

```css
.eg-root {
  --eg-background: #101418;
  --eg-color: #f3efe6;
  --eg-focus-color: #f2b544;
  --eg-radius: 999px;
  --eg-duration: 480ms;
}
```

```tsx
<Lightbox style={{ "--eg-background": "#101418" } as React.CSSProperties} {...props} />
```

### CSS variables

| Variable                      | Default                                                                  | Used for                                              |
| ----------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| `--eg-background`             | `#000`                                                                   | Backdrop                                              |
| `--eg-color`                  | `#fff`                                                                   | Text and icons                                        |
| `--eg-color-muted`            | `rgb(255 255 255 / 0.72)`                                                | Counter and description                               |
| `--eg-focus-color`            | `#fff`                                                                   | Focus ring                                            |
| `--eg-button-background`      | `transparent`                                                            | Toolbar buttons                                       |
| `--eg-arrow-background`       | `rgb(0 0 0 / 0.45)`                                                      | Arrows                                                |
| `--eg-caption-background`     | bottom gradient                                                          | Caption                                               |
| `--eg-selection-background`   | `rgb(255 255 255 / 0.28)`                                                | Text selection                                        |
| `--eg-font-family`            | `inherit`                                                                | All text                                              |
| `--eg-font-size`              | `0.9375rem`                                                              | Caption text                                          |
| `--eg-line-height`            | `1.5`                                                                    | All text                                              |
| `--eg-title-font-size`        | `1rem`                                                                   | Caption title                                         |
| `--eg-title-font-weight`      | `600`                                                                    | Caption title                                         |
| `--eg-counter-font-size`      | `0.875rem`                                                               | Counter                                               |
| `--eg-spacing`                | `16px` (`12px` under 640px)                                              | Outer spacing                                         |
| `--eg-gap`                    | `24px`                                                                   | Gap between slides while sliding                      |
| `--eg-radius`                 | `4px`                                                                    | Buttons and focus ring                                |
| `--eg-top-bar-height`         | `56px`                                                                   | Top bar                                               |
| `--eg-button-size`            | `44px`                                                                   | Toolbar buttons                                       |
| `--eg-arrow-size`             | `48px` (`44px` under 640px)                                              | Arrows                                                |
| `--eg-icon-size`              | `24px`                                                                   | Icons                                                 |
| `--eg-stage-padding`          | top bar height and room for the arrows (top bar height only under 640px) | Space around the image                                |
| `--eg-caption-max-width`      | `65ch`                                                                   | Caption line length                                   |
| `--eg-thumbnail-width`        | `72px` (`56px` under 640px)                                              | Thumbnail width                                       |
| `--eg-thumbnail-height`       | `54px` (`42px` under 640px)                                              | Thumbnail height                                      |
| `--eg-thumbnail-gap`          | `6px`                                                                    | Space between thumbnails                              |
| `--eg-thumbnail-radius`       | `var(--eg-radius)`                                                       | Thumbnail corners                                     |
| `--eg-thumbnail-opacity`      | `0.5`                                                                    | Thumbnails other than the current one                 |
| `--eg-thumbnail-active-color` | `var(--eg-color)`                                                        | Outline of the current thumbnail                      |
| `--eg-thumbnails-height`      | thumbnail height plus spacing                                            | Space reserved for the strip                          |
| `--eg-spinner-size`           | `32px`                                                                   | Loading indicator                                     |
| `--eg-spinner-delay`          | `400ms`                                                                  | How long an image may load before the indicator shows |
| `--eg-media-background`       | `#111`                                                                   | Behind videos, embeds and posters                     |
| `--eg-progress-height`        | `2px`                                                                    | Slideshow progress bar                                |
| `--eg-progress-color`         | `var(--eg-color)`                                                        | Slideshow progress bar                                |
| `--eg-button-opacity`         | `0.8`                                                                    | Buttons at rest                                       |
| `--eg-button-opacity-hover`   | `1`                                                                      | Buttons on hover and focus                            |
| `--eg-disabled-opacity`       | `0.32`                                                                   | Disabled arrows                                       |
| `--eg-drag-shrink`            | `0.2`                                                                    | How much the image shrinks while dragged down         |
| `--eg-duration`               | `320ms`                                                                  | Every animation, including the open and close flight  |
| `--eg-easing`                 | `cubic-bezier(0.2, 0, 0, 1)`                                             | Every animation                                       |
| `--eg-z-index`                | `1000`                                                                   | Stacking                                              |

### Class names

Every part has a stable class: `eg-root`, `eg-backdrop`, `eg-stage`, `eg-slide`, `eg-zoom`, `eg-rotate`, `eg-image`, `eg-video`, `eg-embed`, `eg-embed-poster`, `eg-error`, `eg-top-bar`, `eg-counter`, `eg-toolbar`, `eg-button`, `eg-arrow`, `eg-arrow-prev`, `eg-arrow-next`, `eg-caption`, `eg-caption-title`, `eg-caption-description`, `eg-thumbnails`, `eg-thumbnails-track`, `eg-thumbnails-item`, `eg-thumbnail`, `eg-thumbnail-image`, `eg-progress`, `eg-icon`, `eg-sr-only`.

State is exposed as attributes you can select on:

| Attribute         | On          | Values                                                       |
| ----------------- | ----------- | ------------------------------------------------------------ |
| `data-state`      | `.eg-root`  | `opening`, `open`, `closing`                                 |
| `data-transition` | `.eg-root`  | `slide`, `fade`, `zoom`                                      |
| `data-dragging`   | `.eg-root`  | `horizontal`, `vertical` (only while dragging)               |
| `data-current`    | `.eg-slide` | present on the visible slide                                 |
| `data-zoomed`     | `.eg-root`  | present while the image is magnified                         |
| `data-thumbnails` | `.eg-root`  | present when the strip is shown                              |
| `data-status`     | `.eg-slide` | `loading`, `loaded`, `error` (built-in images only)          |
| `data-gesture`    | `.eg-zoom`  | present while a pinch, pan or wheel zoom follows the pointer |
| `data-playing`    | `.eg-root`  | present while the slideshow plays                            |

## Transitions

```tsx
<Lightbox transition="fade" {...props} />
```

| Value   | Effect                                                                           |
| ------- | -------------------------------------------------------------------------------- |
| `slide` | Slides sit side by side and move together; dragging moves them under the finger. |
| `fade`  | Cross-fade between slides.                                                       |
| `zoom`  | The incoming slide grows from 85% while the outgoing one fades.                  |

All of them animate `transform` and `opacity` only. Their length is `--eg-duration` and their curve `--eg-easing`.

The open animation flies the image out of the element returned by `getThumbnail(index)`, scaled uniformly so it covers that element, and the close animation flies it back to the thumbnail of the slide being shown. When there is no thumbnail, or it is scrolled out of view, the image zooms from 92% and fades in instead.

With `prefers-reduced-motion: reduce`, durations become zero: the lightbox opens, changes slide and closes instantly.

## Navigation and keyboard

| Key                        | Action                                                 |
| -------------------------- | ------------------------------------------------------ |
| `ArrowRight` / `ArrowLeft` | Next / previous slide                                  |
| `+` or `=` / `-`           | Zoom in / out by `zoom.step`                           |
| `0`                        | Reset zoom and rotation                                |
| `Home` / `End`             | First / last slide                                     |
| `Escape`                   | Close                                                  |
| `Tab` / `Shift+Tab`        | Move between the dialog's buttons (focus stays inside) |

Set `keyboard={false}` to turn off every shortcut above except Tab. Arrow keys, Home and End are left alone while a video, input or editable element has focus. With `loop={false}` the gallery stops at both ends and the arrows are disabled there.

## Gestures

Gestures use Pointer Events on the stage, so they work with touch, pen and mouse.

- **Horizontal drag:** follows the pointer. Releasing past `swipeThreshold` (50px by default), or flicking faster than 0.5px/ms, changes slide. Dragging past the first or last slide without `loop` meets resistance.
- **Vertical drag:** moves and shrinks the image and fades the backdrop. Releasing after a drag of 20% of the viewport height, or a flick projected past 40%, closes. Short taps never close.
- A drag never counts as a backdrop click.
- **Pinch, double tap and drag while zoomed** are described in [Zoom](#zoom). While the image is magnified, a one-finger drag pans it instead of changing slide or closing.

Turn gestures off with `swipe={false}`.

## Thumbnails

The strip lists every slide as a button at the bottom of the viewer. The current one has `aria-current="true"` and an outline, the strip scrolls natively (touch, wheel, keyboard) and it centers the current thumbnail whenever the slide changes.

```tsx
<Lightbox
  thumbnails
  labels={{ thumbnails: "Miniaturas", thumbnail: (i) => `Ver imagem ${i}` }}
  render={{ thumbnail: (slide) => <img src={slide.thumbnail} alt="" /> }}
  {...props}
/>
```

- Images use `slide.thumbnail`, falling back to `slide.src`, with `loading="lazy"`.
- Each button is named by `labels.thumbnail`, so a custom `render.thumbnail` stays accessible.
- Size and look come from the `--eg-thumbnail-*` variables; `classNames.thumbnails` and `classNames.thumbnail` add your own classes.
- `thumbnails={false}` removes it.

## Zoom

Built-in images can be magnified up to `maxScale` times their fitted size.

| Input                       | Action                                                  |
| --------------------------- | ------------------------------------------------------- |
| Mouse wheel, trackpad pinch | Zoom around the pointer                                 |
| Double click, double tap    | Zoom to `doubleTapScale` at that point, or back to 1    |
| Two-finger pinch            | Zoom around the fingers; moving them pans               |
| Drag while zoomed           | Pan, stopping where the image edge meets the stage edge |
| Zoom in / Zoom out buttons  | Multiply or divide by `step`; disabled at the limits    |
| `+`, `-`, `0`               | Same as the buttons; `0` resets                         |

```tsx
<Lightbox zoom={{ maxScale: 4, step: 2, doubleTapScale: 2.5, wheel: false }} {...props} />
```

| Option           | Default | Description                                                                |
| ---------------- | ------- | -------------------------------------------------------------------------- |
| `minScale`       | `1`     | Smallest scale. Below 1 lets users shrink the image under its fitted size. |
| `maxScale`       | `3`     | Largest scale.                                                             |
| `step`           | `1.5`   | Factor for the buttons and keys.                                           |
| `doubleTapScale` | `2`     | Scale reached by a double click or tap.                                    |
| `wheel`          | `true`  | Zoom with the wheel and trackpad pinch.                                    |

Zoom resets when the slide changes, the window resizes or the viewer closes. While zoomed, `sizes` grows to the magnified width so the browser can pick a sharper `srcset` candidate. Pinches past the limits meet resistance and settle back on release. Slides drawn by `render.slide` do not zoom. `zoom={false}` turns it all off.

## Fullscreen

Where the Fullscreen API is available, the toolbar shows a toggle that puts the dialog itself in fullscreen. Its name switches between `labels.enterFullscreen` and `labels.exitFullscreen`, and it follows changes made outside the lightbox, such as the browser's own Escape. Closing the viewer leaves fullscreen. Where the API is missing (for example on iPhone), the button is not rendered: the viewer already covers the window. `fullscreen={false}` hides it everywhere.

## Loading and errors

While a built-in image loads, its slide has `data-status="loading"` and, after `--eg-spinner-delay`, shows a spinner. If the image fails, the slide shows `labels.loadError` instead of a broken image and gets `data-status="error"`.

## Video and embeds

A slide can be a video file, a YouTube or Vimeo link, or any page:

```tsx
const slides: Slide[] = [
  {
    src: "/media/talk.mp4",
    poster: "/media/talk.jpg",
    width: 1920,
    height: 1080,
    alt: "Conference talk",
    sources: [
      { src: "/media/talk.webm", type: "video/webm" },
      { src: "/media/talk.mp4", type: "video/mp4" },
    ],
    tracks: [{ src: "/media/talk.en.vtt", srcLang: "en", label: "English", default: true }],
  },
  { src: "https://www.youtube.com/watch?v=VIDEO_ID", title: "Product tour" },
  { src: "https://vimeo.com/VIDEO_ID", alt: "Short film" },
  { src: "https://maps.example.com/embed?q=porto", type: "iframe", title: "Map" },
];

<Lightbox slides={slides} video={{ autoplay: false }} {...props} />;
```

| Kind       | Detected from                                                                            | Renders                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Video file | `.mp4`, `.webm`, `.ogv`, `.ogg`, `.mov`, `.m4v`, or `type: "video"`                      | Native `<video>` with `controls`, `playsInline`, `preload="metadata"`, `poster`, `sources` and `tracks` |
| YouTube    | `youtube.com/watch`, `youtu.be`, `/embed/`, `/shorts/`, `/live/`, `youtube-nocookie.com` | Iframe on `https://www.youtube-nocookie.com/embed/ID`, keeping a `t` or `start` time                    |
| Vimeo      | `vimeo.com/ID`, `vimeo.com/ID/HASH`, `player.vimeo.com/video/ID`                         | Iframe on `https://player.vimeo.com/video/ID` with `dnt=1` and the private hash                         |
| Page       | `type: "iframe"`                                                                         | Iframe on `src`                                                                                         |

- Videos and embeds are sized with `width` and `height` (16:9 when unknown; a video's own size once its metadata loads). An `iframe` slide without a size fills the stage.
- When a video slide stops being current its player is paused; embeds exist only on the current slide, so leaving the slide stops them, and closing the lightbox removes everything. Neighboring embed slides show `poster` (YouTube falls back to its own thumbnail, then `thumbnail`).
- No player scripts are loaded. YouTube and Vimeo run inside their iframes only.
- `video.autoplay` starts the current video or embed muted, which is what browsers allow without a user gesture.
- Players get an accessible name from `alt`, then a string `title`, then `labels.video`. Pass `tracks` for captions.
- Gestures that start on a player are left to it, and arrow keys stay with a focused `<video>`. Zoom buttons are hidden on these slides.
- `getMedia(slide)` is exported if you need the same detection in your own grid.

## Slideshow

```tsx
<Lightbox slideshow={{ interval: 4000, autoplay: true, progress: true }} {...props} />
```

`slideshow` adds a play and pause button to the toolbar. While playing, the lightbox advances every `interval` ms and shows a progress bar along the top.

| Option     | Default | Description                            |
| ---------- | ------- | -------------------------------------- |
| `interval` | `5000`  | Time per slide, in ms.                 |
| `autoplay` | `false` | Start playing when the lightbox opens. |
| `progress` | `true`  | Show the progress bar.                 |

It pauses when the user navigates (arrows, keys, swipe, thumbnails), and stops on the last slide when `loop` is false. It waits while the page is hidden and starts the slide's full interval again when it comes back. On a video slide it plays the video, waits for it to end and stops if the viewer pauses it, for the built-in player and for [custom players](#custom-players-videojs-plyr-mux); on an embed it holds until the user moves on, because the embedded player cannot be observed without its script. The button's name switches between `labels.playSlideshow` and `labels.pauseSlideshow`, which gives users the pause control WCAG asks for on moving content.

## Custom players (Video.js, Plyr, Mux…)

`render.slide` can put any player in a slide. The lightbox stays out of its way:

- **Slideshow:** set `type: "video"` on the slide. The slideshow button plays and pauses the first `<video>` in the current slide, waits on it, advances when it fires `ended` and stops when the viewer pauses it. Any player that renders a native `<video>` works without extra wiring.
- **Gestures:** pointer drags that start on a `video`, `iframe`, button, link, form field, `role="slider"` or anything inside `[data-eg-no-gestures]` are left to that element, so scrubbing or changing the volume never swipes.
- **Keyboard:** keys that content already handled (`event.preventDefault()`) are ignored, so a player's own shortcuts win while it has focus.
- **Leaving the slide:** native videos in other slides are paused. Unmounting does the rest: only `preload` slides are mounted.

### Video.js 10

[Video.js 10](https://videojs.org/docs/framework/react/llms.txt) (`@videojs/react`, 10.2.0 at the time of writing) renders a native `<video>` inside a fully customisable skin, so it slots straight into `render.slide`:

```tsx
import "@videojs/react/video/skin.css";
import { Video, VideoPlayer, VideoSkin } from "@videojs/react/video";
import { Lightbox, type Slide } from "@esdrassantos06/gallery";

const slides: Slide[] = [
  {
    src: "/media/talk.mp4",
    type: "video",
    poster: "/media/talk.jpg",
    width: 1920,
    height: 1080,
    alt: "Talk",
  },
  { src: "/photos/stage.jpg", width: 1600, height: 1067, alt: "Stage" },
];

<Lightbox
  slides={slides}
  slideshow
  render={{
    slide: ({ slide, width, height }) =>
      slide.type === "video" ? (
        <VideoPlayer>
          <VideoSkin style={{ width, height }}>
            <Video src={slide.src} poster={slide.poster} playsInline preload="metadata">
              <track
                kind="captions"
                src="/media/talk.en.vtt"
                srcLang="en"
                label="English"
                default
              />
            </Video>
          </VideoSkin>
        </VideoPlayer>
      ) : undefined,
  }}
  {...props}
/>;
```

- **Theme:** the packaged skin reads `--media-accent-color`, `--media-accent-text-color`, `--media-border-color`, `--media-border-radius`, `--media-font-family`, `--media-object-fit`, `--media-object-position` and `--media-scale-unit`, so it can share the lightbox's `--eg-*` values.
- **Full control:** `npx shadcn@latest add @videojs/video` copies the skin's source into your project to add, remove or restyle controls, or build your own skin from the Video.js UI components.
- **Content Security Policy:** Video.js documents `style-src 'unsafe-inline'` for some player UI, plus `media-src blob:`, `worker-src blob:` and `connect-src` for HLS or DASH. The lightbox itself needs none of these.

The example follows the Video.js 10 documentation ([installation](https://videojs.org/docs/framework/react/how-to/installation.md), [customise skins](https://videojs.org/docs/framework/react/guides/customize-skins.md), [`Video`](https://videojs.org/docs/framework/react/reference/components/video.md), [CSP](https://videojs.org/docs/framework/react/guides/content-security-policy.md)). The `poster` prop on `Video` is forwarded to the native element, as `Video` forwards native attributes.

## Deep linking

`useLightboxHash` keeps the open slide in the URL hash, so a photo can be linked to and the browser's back button closes the viewer. Use it as the lightbox's state:

```tsx
import { Lightbox, useLightboxHash } from "@esdrassantos06/gallery";

const [index, setIndex] = useLightboxHash("galeria", { count: slides.length });

<Lightbox
  slides={slides}
  open={index >= 0}
  index={Math.max(index, 0)}
  onIndexChange={setIndex}
  onClose={() => setIndex(-1)}
/>;
```

| URL                                             | State                                           |
| ----------------------------------------------- | ----------------------------------------------- |
| `/fotos#galeria-3`                              | Open on the third slide (the number is 1-based) |
| `/fotos`, `/fotos#contact`, `/fotos#galeria-99` | Closed                                          |

- Opening adds one history entry; changing slide replaces it, so history does not fill up.
- Closing goes back to the entry that was there before, which restores the previous URL, hash and scroll position. The back button closes the viewer and forward reopens it.
- When the page was loaded with the hash (someone followed a shared link), closing removes the hash in place instead of leaving the page.
- The state is read from the URL, so URL and lightbox cannot drift apart or loop. Hashes that do not match the prefix, other query strings and paths are never touched.
- `count` makes links past the last slide read as closed. Use a different prefix for each gallery on a page.
- On the server and during hydration it reads `-1`; a deep-linked gallery opens right after hydration.

## Rotation

```tsx
<Lightbox rotate {...props} />
```

`rotate` adds rotate left and right buttons for images. Each press turns the image 90 degrees and turns add up, so four presses bring it back the long way round with a smooth animation. A sideways image is fitted again so it still fits the stage, and zoom, pinch and pan keep working on the rotated image. Rotation resets on slide change, when the viewer closes and with the `0` key, which also resets zoom.

## Download

```tsx
<Lightbox
  download={{
    filename: (slide, index) => `obra-${index + 1}.jpg`,
    onError: (error, slide) => report(error, slide.src),
  }}
  {...props}
/>
```

`download` (off by default) adds a download button on images and video files. Embeds never get one.

- **Same-origin files** are saved directly with a hidden `<a download>`.
- **Cross-origin files** are fetched with CORS and saved from a blob, because browsers ignore the `download` attribute across origins. If the server refuses (no CORS headers, an HTTP error or a network failure), the file opens in a new tab instead, `labels.downloadError` is announced and `onError` is called. Nothing assumes the server allows direct downloads.
- `slide.download` points the button at another URL, for example the original file instead of a resized `src`; `slide.download = false` hides it on that slide.
- The file name comes from `slide.downloadName`, then `download.filename(slide, index)`, then the last segment of the URL.

## Accessibility

- The lightbox is a `role="dialog"` with `aria-modal="true"` and an accessible name from `labels.dialog`.
- Focus moves into the dialog when it opens, `Tab` is trapped inside, and on close focus goes to `getThumbnail(index)` for the slide being shown, or to the element that opened it.
- Every button has an `aria-label` from `labels`. Icons are `aria-hidden`.
- The thumbnail strip is a `nav` named by `labels.thumbnails`; the current thumbnail has `aria-current="true"`.
- The fullscreen toggle changes its name between `labels.enterFullscreen` and `labels.exitFullscreen`.
- Videos and embeds are named from `alt`, a string `title` or `labels.video`; `tracks` adds captions.
- The slideshow can always be paused from its button, and it stops on its own when the user takes over.
- Rotate and download buttons are named by `labels`; a failed download is announced through a `role="status"` region.
- When a focused button becomes disabled (for example zoom in at the maximum), focus moves back to the dialog instead of getting lost.
- A polite live region announces the current slide (`labels.announcement`).
- Slides other than the current one are `aria-hidden`.
- Page scroll is locked while open. The body is padded by the scrollbar width so the page does not shift, and the previous inline styles are restored exactly.
- `prefers-reduced-motion` is respected.
- Controls are at least 44 × 44px and show a visible focus ring.

## Content Security Policy

The package loads nothing from third parties, uses no CDN and injects no inline scripts. Styles come from the stylesheet you import (`style-src 'self'` when you self-host it). Sizes, positions and drag offsets are written through the CSSOM (`element.style`), which `style-src` does not restrict, and nothing is server-rendered, so no `'unsafe-inline'` is needed.

Images, videos and pages load from the URLs you pass. A policy for a gallery with self-hosted media plus YouTube and Vimeo slides:

```
Content-Security-Policy:
  img-src 'self' https://i.ytimg.com;
  media-src 'self';
  frame-src https://www.youtube-nocookie.com https://player.vimeo.com;
```

- `img-src https://i.ytimg.com` is only needed for the YouTube posters shown on neighboring slides; drop it if every YouTube slide has its own `poster`.
- Add the origins of any `type: "iframe"` pages to `frame-src`, and your CDN to `img-src` and `media-src`.
- The YouTube and Vimeo players load their own scripts and images inside their frames; those requests are governed by the provider, not by your page's policy.

## Performance

- Only `preload` slides on each side of the current one are in the DOM. Full-size images outside that window are never requested. Thumbnails load lazily, as they scroll into the strip.
- Images get explicit `width` and `height` from `fitContain`, based on the natural size you pass and the stage size measured by a single `ResizeObserver`. Without a natural size, it is read once the image loads.
- When `srcSet` is set and `sizes` is not, `sizes` is the rendered width, so the browser picks the smallest candidate that fills it.
- Drags write CSS variables on the root once per animation frame, and pinch, pan and wheel zoom write the transform straight to the element; React does not re-render while a gesture moves.
- Listeners and observers are removed on close and unmount.

## Bundle size

Measured with [size-limit](https://github.com/ai/size-limit) (`npm run size`) on version 1.0.0 (phase 4), minified and brotli-compressed, React excluded:

| Entry                 | Size    |
| --------------------- | ------- |
| `import { Lightbox }` | 9.28 kB |
| Everything            | 9.68 kB |
| `styles.css`          | 2.25 kB |

## Site and playground

The demo site lives in `playground/` (Vite, Tailwind CSS and shadcn/ui, Geist type to match the logo). It doubles as the playground:

```bash
npm install
npm run dev
```

It has three galleries of locally generated samples: the default look, driven by a panel of options and kept in the URL hash as `#galeria-N`; a customised one with Portuguese labels, replaced icons, a custom caption, an extra toolbar link and a theme set through `--eg-*` variables; and a video and slideshow gallery with a native video with captions and an iframe slide.

`npm run build:site` builds it into `playground/dist`. It is live at [gallery-esdrassantos06.vercel.app](https://gallery-esdrassantos06.vercel.app) and deploys to Vercel as a static site with `vercel.json`, which also sends a strict Content Security Policy (`default-src 'self'`, no `'unsafe-inline'`) that the whole site, lightbox included, runs under.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) and the [Code of Conduct](./CODE_OF_CONDUCT.md); report vulnerabilities as described in [SECURITY.md](./SECURITY.md). Changes are listed in [CHANGELOG.md](./CHANGELOG.md).

## Publishing

See [PUBLISHING.md](./PUBLISHING.md) for the first manual release and the automated, token-free releases through npm Trusted Publishing.

## Development

| Script                  | What it does                                      |
| ----------------------- | ------------------------------------------------- |
| `npm run dev`           | Playground                                        |
| `npm run test`          | Unit and integration tests (Vitest, jsdom)        |
| `npm run e2e`           | Playwright on desktop Chrome and Pixel 7          |
| `npm run typecheck`     | TypeScript, including isolated declaration checks |
| `npm run lint`          | ESLint with React Hooks and jsx-a11y              |
| `npm run build`         | ESM bundle, declarations and stylesheet in `dist` |
| `npm run size`          | Bundle size                                       |
| `npm run check:package` | publint and Are the Types Wrong                   |

## Roadmap

Planned, **not available yet**. The full plan is in [ROADMAP.md](./ROADMAP.md).

1. Optional grids (masonry, justified, uniform) with a category filter.
2. Toolbar overflow menu, idle-hiding controls, right-to-left layouts, pinch to close, flip, Web Share, pager dots.
3. Release tooling: CI on React 18 and 19, npm Trusted Publishing.

## License

[MIT](./LICENSE)
