<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/logo/logo-dark.svg" />
    <img src="./assets/logo/logo-light.svg" alt="@esdrassantos06/gallery" width="280" />
  </picture>
</p>

# @esdrassantos06/gallery

An accessible, themeable image lightbox for React. It has zero runtime dependencies, works with any grid, and every string, icon, color, size and timing can be replaced.

> **Status:** version 1.0.0, phase 2 of 7. The core lightbox, the thumbnail strip, zoom and fullscreen described below are implemented and tested. Video, slideshow, deep linking, rotation, download and the optional grids are planned and **not available yet** (see [Roadmap](#roadmap)).

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
- [Accessibility](#accessibility)
- [Content Security Policy](#content-security-policy)
- [Performance](#performance)
- [Bundle size](#bundle-size)
- [Playground](#playground)
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
| `getThumbnail`         | `(index: number) => HTMLElement \| null \| undefined` |                 | Element that opened a slide. Animations start and end there and focus returns to it. Without it, focus returns to the element focused before opening. |
| `labels`               | `Partial<LightboxLabels>`                             | English         | See [Labels](#labels-and-translations).                                                                                                               |
| `icons`                | `Partial<LightboxIcons>`                              | built-in        | See [Icons](#icons).                                                                                                                                  |
| `classNames`           | `Partial<LightboxClassNames>`                         |                 | Extra classes per part, next to the `eg-*` ones.                                                                                                      |
| `render`               | `LightboxRender`                                      |                 | See [Render overrides](#render-overrides).                                                                                                            |
| `className`            | `string`                                              |                 | Extra class on the root element.                                                                                                                      |
| `style`                | `CSSProperties`                                       |                 | Inline style on the root element, handy for `--eg-*` variables.                                                                                       |
| `container`            | `HTMLElement \| null`                                 | `document.body` | Element the dialog is portalled into.                                                                                                                 |

### `Slide`

| Field             | Type        | Description                                                                                                      |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `src`             | `string`    | Image URL.                                                                                                       |
| `srcSet`          | `string`    | Responsive candidates for `<img srcset>`.                                                                        |
| `sizes`           | `string`    | `<img sizes>` when `srcSet` is set. Defaults to the width the image is rendered at, in px.                       |
| `width`, `height` | `number`    | Natural size in px. Recommended.                                                                                 |
| `alt`             | `string`    | Alternative text.                                                                                                |
| `title`           | `ReactNode` | Caption heading (`h2`).                                                                                          |
| `description`     | `ReactNode` | Caption text.                                                                                                    |
| `thumbnail`       | `string`    | Preview image for the thumbnail strip. Falls back to `src`, which downloads the full image, so pass a small one. |

### `LightboxClassNames` parts

`root`, `backdrop`, `topBar`, `counter`, `toolbar`, `button`, `arrow`, `stage`, `slide`, `image`, `caption`, `thumbnails`, `thumbnail`.

### Other exports

| Export                                           | Description                                                                                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultLabels`                                  | The English labels, to extend instead of rewriting.                                                                                                           |
| `defaultIcons`                                   | The built-in icons.                                                                                                                                           |
| `Icon`                                           | The SVG base used by the built-in icons (24 × 24 grid, 1.5px stroke, `currentColor`). Use it to draw matching icons.                                          |
| `fitContain(width, height, boxWidth, boxHeight)` | The fit math the lightbox uses: scales a size into a box without upscaling.                                                                                   |
| Types                                            | `Slide`, `Transition`, `ZoomOptions`, `LightboxProps`, `LightboxLabels`, `LightboxIcons`, `LightboxClassNames`, `LightboxRender`, `RenderSlideProps`, `Size`. |

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

| Key                                   | Default                           |
| ------------------------------------- | --------------------------------- |
| `dialog`                              | `Image viewer`                    |
| `close`                               | `Close`                           |
| `previous`                            | `Previous image`                  |
| `next`                                | `Next image`                      |
| `counter(current, total)`             | `3 / 12`                          |
| `announcement(current, total, slide)` | `Image 3 of 12: <title or alt>`   |
| `thumbnails`                          | `Thumbnails`                      |
| `thumbnail(index, total, slide)`      | `Show image 3`                    |
| `zoomIn`                              | `Zoom in`                         |
| `zoomOut`                             | `Zoom out`                        |
| `enterFullscreen`                     | `Enter fullscreen`                |
| `exitFullscreen`                      | `Exit fullscreen`                 |
| `loadError`                           | `This image could not be loaded.` |

## Icons

The built-in icons are drawn for this package: 24 × 24, 1.5px round stroke, `currentColor`. Replace any of them with any React node: `close`, `previous`, `next`, `zoomIn`, `zoomOut`, `enterFullscreen` and `exitFullscreen`. The `Icon` export gives you the same frame:

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
- `render.toolbar` receives the built-in buttons (zoom in, zoom out, fullscreen when available, close) plus the current slide and index.
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
| `--eg-button-opacity`         | `0.8`                                                                    | Buttons at rest                                       |
| `--eg-button-opacity-hover`   | `1`                                                                      | Buttons on hover and focus                            |
| `--eg-disabled-opacity`       | `0.32`                                                                   | Disabled arrows                                       |
| `--eg-drag-shrink`            | `0.2`                                                                    | How much the image shrinks while dragged down         |
| `--eg-duration`               | `320ms`                                                                  | Every animation, including the open and close flight  |
| `--eg-easing`                 | `cubic-bezier(0.2, 0, 0, 1)`                                             | Every animation                                       |
| `--eg-z-index`                | `1000`                                                                   | Stacking                                              |

### Class names

Every part has a stable class: `eg-root`, `eg-backdrop`, `eg-stage`, `eg-slide`, `eg-zoom`, `eg-image`, `eg-error`, `eg-top-bar`, `eg-counter`, `eg-toolbar`, `eg-button`, `eg-arrow`, `eg-arrow-prev`, `eg-arrow-next`, `eg-caption`, `eg-caption-title`, `eg-caption-description`, `eg-thumbnails`, `eg-thumbnails-track`, `eg-thumbnails-item`, `eg-thumbnail`, `eg-thumbnail-image`, `eg-icon`, `eg-sr-only`.

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
| `0`                        | Reset the zoom                                         |
| `Home` / `End`             | First / last slide                                     |
| `Escape`                   | Close                                                  |
| `Tab` / `Shift+Tab`        | Move between the dialog's buttons (focus stays inside) |

Set `keyboard={false}` to turn off every shortcut above except Tab. With `loop={false}` the gallery stops at both ends and the arrows are disabled there.

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

## Accessibility

- The lightbox is a `role="dialog"` with `aria-modal="true"` and an accessible name from `labels.dialog`.
- Focus moves into the dialog when it opens, `Tab` is trapped inside, and on close focus goes to `getThumbnail(index)` for the slide being shown, or to the element that opened it.
- Every button has an `aria-label` from `labels`. Icons are `aria-hidden`.
- The thumbnail strip is a `nav` named by `labels.thumbnails`; the current thumbnail has `aria-current="true"`.
- The fullscreen toggle changes its name between `labels.enterFullscreen` and `labels.exitFullscreen`.
- When a focused button becomes disabled (for example zoom in at the maximum), focus moves back to the dialog instead of getting lost.
- A polite live region announces the current slide (`labels.announcement`).
- Slides other than the current one are `aria-hidden`.
- Page scroll is locked while open. The body is padded by the scrollbar width so the page does not shift, and the previous inline styles are restored exactly.
- `prefers-reduced-motion` is respected.
- Controls are at least 44 × 44px and show a visible focus ring.

## Content Security Policy

The package loads nothing from third parties, uses no CDN and injects no inline scripts. Styles come from the stylesheet you import (`style-src 'self'` when you self-host it). Sizes, positions and drag offsets are written through the CSSOM (`element.style`), which `style-src` does not restrict, and nothing is server-rendered, so no `'unsafe-inline'` is needed.

Images are loaded from the URLs you pass, so `img-src` must allow them:

```
Content-Security-Policy: img-src 'self' https://your-image-cdn.example;
```

## Performance

- Only `preload` slides on each side of the current one are in the DOM. Full-size images outside that window are never requested. Thumbnails load lazily, as they scroll into the strip.
- Images get explicit `width` and `height` from `fitContain`, based on the natural size you pass and the stage size measured by a single `ResizeObserver`. Without a natural size, it is read once the image loads.
- When `srcSet` is set and `sizes` is not, `sizes` is the rendered width, so the browser picks the smallest candidate that fills it.
- Drags write CSS variables on the root once per animation frame, and pinch, pan and wheel zoom write the transform straight to the element; React does not re-render while a gesture moves.
- Listeners and observers are removed on close and unmount.

## Bundle size

Measured with [size-limit](https://github.com/ai/size-limit) (`npm run size`) on version 1.0.0 (phase 2), minified and brotli-compressed, React excluded:

| Entry                 | Size    |
| --------------------- | ------- |
| `import { Lightbox }` | 6.94 kB |
| Everything            | 6.98 kB |
| `styles.css`          | 2.09 kB |

## Playground

```bash
npm install
npm run dev
```

It opens on Vite with two galleries of generated sample images: one with the default look, driven by a panel of options (transition, loop, backdrop click, keyboard, thumbnails, fullscreen, zoom and its maximum, preload, swipe threshold), and one customised with Portuguese labels, replaced icons, a custom caption, an extra toolbar link and a theme set through `--eg-*` variables.

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

1. Video slides (MP4, YouTube through `youtube-nocookie.com`, Vimeo), iframe slides and slideshow.
2. Hash deep linking, rotation and flip, download.
3. Optional grids (masonry, justified, uniform) with a category filter.
4. Toolbar overflow menu, idle-hiding controls, right-to-left layouts, pinch to close, Web Share, pager dots.
5. Release tooling: CI on React 18 and 19, npm Trusted Publishing.

## License

[MIT](./LICENSE)
