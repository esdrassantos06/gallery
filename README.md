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

**[Documentation and live demos](https://gallery-esdrassantos06.vercel.app)**

An accessible, themeable image lightbox for React, with optional masonry, justified and uniform grids and a category filter. The lightbox opens out of the thumbnail that was clicked and flies back into it on close. It has zero runtime dependencies, works with any grid, and every string, icon, color, size and timing can be replaced.

> **Status:** version 1.0.0, phase 6 of 7. Everything listed below is implemented and tested. The grids, the filter and the phase 6 polish (flip, share, pager dots, idle controls, right-to-left, pinch to close and the toolbar overflow menu) are on `main` and ship in the next release, not in 1.0.0. Interaction polish and the rest of the release tooling are planned and **not available yet** (see the [roadmap](https://gallery-esdrassantos06.vercel.app/docs/roadmap)).

## Features

- Open and close animation from your thumbnail, with a zoom and fade fallback.
- Arrows, keyboard, swipe and flick navigation, with `slide`, `fade` and `zoom` transitions.
- Thumbnail strip or pager dots, zoom (wheel, pinch, double tap, buttons, keys), pinch to close, fullscreen, rotation, flip, sharing and downloads.
- A toolbar that moves what does not fit into an accessible "More options" menu, controls that fade out when idle, and right-to-left layouts.
- Native video with captions, YouTube and Vimeo without their player scripts, any page in an iframe, and room for [custom players](https://gallery-esdrassantos06.vercel.app/docs/custom-players) such as Video.js 10.
- Slideshow that pauses when the user takes over.
- Optional [justified, masonry and uniform grids](https://gallery-esdrassantos06.vercel.app/docs/grids) and a [category filter](https://gallery-esdrassantos06.vercel.app/docs/filter), each usable with or without the lightbox.
- Deep links through the URL hash with `useLightboxHash`, closed by the back button.
- Modal dialog semantics, focus trap and return, a live region, reduced motion and a scroll lock that keeps the page still.
- Server-rendering safe, ready for the Next.js App Router.
- Styled with `--eg-*` CSS variables. The lightbox needs no `'unsafe-inline'` in a Content Security Policy.

## Installation

```bash
npm install @esdrassantos06/gallery
```

```ts
import "@esdrassantos06/gallery/styles.css";
```

React 18 or 19 is a peer dependency. The package is ESM only and ships TypeScript declarations.

## Quick start

The lightbox is controlled: you own `open` and `index`, it tells you when the user wants to change them. Keep it mounted so the close animation can play.

```tsx
import { useRef, useState } from "react";
import { Lightbox, type Slide } from "@esdrassantos06/gallery";
import "@esdrassantos06/gallery/styles.css";

const slides: Slide[] = [
  {
    src: "/photos/harbour.jpg",
    width: 1600,
    height: 1067,
    alt: "Boats in the harbour",
    title: "Harbour",
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

## Documentation

The full documentation, with live demos on every page, is at **[gallery-esdrassantos06.vercel.app](https://gallery-esdrassantos06.vercel.app/docs)**.

| Topic           | Pages                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Getting started | [Installation](https://gallery-esdrassantos06.vercel.app/docs/installation), [Quick start](https://gallery-esdrassantos06.vercel.app/docs/quick-start), [Next.js App Router](https://gallery-esdrassantos06.vercel.app/docs/nextjs), [Server rendering](https://gallery-esdrassantos06.vercel.app/docs/ssr)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Features        | [Slides](https://gallery-esdrassantos06.vercel.app/docs/slides), [Navigation and gestures](https://gallery-esdrassantos06.vercel.app/docs/navigation), [Thumbnails](https://gallery-esdrassantos06.vercel.app/docs/thumbnails), [Pager dots](https://gallery-esdrassantos06.vercel.app/docs/pager), [Zoom](https://gallery-esdrassantos06.vercel.app/docs/zoom), [Fullscreen](https://gallery-esdrassantos06.vercel.app/docs/fullscreen), [Slideshow](https://gallery-esdrassantos06.vercel.app/docs/slideshow), [Deep linking](https://gallery-esdrassantos06.vercel.app/docs/deep-linking), [Rotation](https://gallery-esdrassantos06.vercel.app/docs/rotation), [Flip](https://gallery-esdrassantos06.vercel.app/docs/flip), [Download](https://gallery-esdrassantos06.vercel.app/docs/download), [Share](https://gallery-esdrassantos06.vercel.app/docs/share), [Toolbar and overflow menu](https://gallery-esdrassantos06.vercel.app/docs/toolbar), [Idle controls](https://gallery-esdrassantos06.vercel.app/docs/idle), [Right-to-left](https://gallery-esdrassantos06.vercel.app/docs/rtl), [Custom players](https://gallery-esdrassantos06.vercel.app/docs/custom-players), [Grids](https://gallery-esdrassantos06.vercel.app/docs/grids), [Category filter](https://gallery-esdrassantos06.vercel.app/docs/filter) |
| Customising     | [Labels and i18n](https://gallery-esdrassantos06.vercel.app/docs/labels), [Icons](https://gallery-esdrassantos06.vercel.app/docs/icons), [Render overrides](https://gallery-esdrassantos06.vercel.app/docs/render), [Styling](https://gallery-esdrassantos06.vercel.app/docs/styling), [Class names and data attributes](https://gallery-esdrassantos06.vercel.app/docs/class-names)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Reference       | [Lightbox props](https://gallery-esdrassantos06.vercel.app/docs/lightbox-props), [Slide](https://gallery-esdrassantos06.vercel.app/docs/slide), [Exports](https://gallery-esdrassantos06.vercel.app/docs/exports)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Guides          | [Accessibility](https://gallery-esdrassantos06.vercel.app/docs/accessibility), [Content Security Policy](https://gallery-esdrassantos06.vercel.app/docs/csp), [Performance](https://gallery-esdrassantos06.vercel.app/docs/performance), [Bundle size](https://gallery-esdrassantos06.vercel.app/docs/bundle-size), [Migrating from yet-another-react-lightbox](https://gallery-esdrassantos06.vercel.app/docs/migration)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

The source of the docs lives in [`docs/`](./docs), and the prop tables there are generated from [`src/types.ts`](./src/types.ts).

## Bundle size

Measured with `npm run size` on `main` after phase 6, minified and brotli-compressed, React excluded:

| Entry                                                               | Size     |
| ------------------------------------------------------------------- | -------- |
| `import { Lightbox }`                                               | 11.55 kB |
| `import { MasonryGrid, JustifiedGrid, UniformGrid, GalleryFilter }` | 1.89 kB  |
| Everything                                                          | 13.42 kB |
| `styles.css`                                                        | 3.31 kB  |

## Development

| Script                  | What it does                                      |
| ----------------------- | ------------------------------------------------- |
| `npm run dev`           | Playground on Vite, also used by the e2e tests    |
| `npm run test`          | Unit and integration tests (Vitest, jsdom)        |
| `npm run e2e`           | Playwright on desktop Chrome and Pixel 7          |
| `npm run typecheck`     | TypeScript, including isolated declaration checks |
| `npm run lint`          | ESLint with React Hooks and jsx-a11y              |
| `npm run build`         | ESM bundle, declarations and stylesheet in `dist` |
| `npm run size`          | Bundle size                                       |
| `npm run check:package` | publint and Are the Types Wrong                   |

The public site, with the docs and demos, lives in [`docs/`](./docs) (Next.js and Fumadocs) and has its own scripts: `npm run dev --prefix docs` and `npm run build --prefix docs`. It is a static export deployed to Vercel by [`vercel.json`](./vercel.json). Every page carries a Content Security Policy with `default-src 'self'` and no `'unsafe-inline'`: the inline scripts, style tags and style attributes of the export are allowed by SHA-256 hashes, added at build time.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) and the [Code of Conduct](./CODE_OF_CONDUCT.md), and report vulnerabilities as described in [SECURITY.md](./SECURITY.md). Changes are listed in [CHANGELOG.md](./CHANGELOG.md), and releases are described in [PUBLISHING.md](./PUBLISHING.md).

## License

[MIT](./LICENSE). The justified layout math is adapted from opengallery, MIT License, Copyright (c) 2026 opengallery contributors.
