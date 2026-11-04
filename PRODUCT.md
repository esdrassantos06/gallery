# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React component library published to npm as `liftbox`. TypeScript strict, ESM output with types built by tsdown. React 18 and 19 as peer dependencies, zero runtime dependencies. Playground on Vite. Chosen by the user.

## Users

- **Primary:** the author (Esdras Santos), reusing the package across his own projects.
- **First consumer:** the open-source ModuloService PT site (Next.js 16 App Router, next-intl, pt/en/es), replacing react-photo-album and yet-another-react-lightbox in `site/src/components/galeria.tsx` and `lightbox.tsx`.
- **Secondary:** any React developer who installs it from npm.
- **End users:** visitors of those sites browsing photos and videos on desktop and phone, including keyboard and screen reader users.

## Product Purpose

A gallery and lightbox developed under the MIT license, using a friend's existing MIT-licensed project as the foundation. The goal is to build upon and extend that project into a complete, reusable solution with all the necessary gallery and lightbox features. Success: the ModuloService site replaces its two existing libraries with this solution without losing any features, and every future project only needs CSS variables and props to match its own brand.

## Positioning

Own code, MIT, zero runtime dependencies, fully themeable by CSS variables, every visible string and icon replaceable, accessible by default and verified in a real browser.

## Capabilities and Constraints

- Phases in order: (1) core lightbox, (2) thumbnails, zoom, fullscreen, (3) video and slideshow, (4) hash deep link, rotate, download. Optional grid (masonry, justified, uniform) with category filter.
- The lightbox must work with any grid, not only the bundled one.
- Next.js App Router safe: `"use client"`, no `window`/`document` outside effects.
- CSP friendly: no CDN, no inline scripts. YouTube via youtube-nocookie.com.
- Animations only on transform and opacity (plus clip-path for the cropped open and close flight); `prefers-reduced-motion` disables them; offscreen images do not load.
- Full customisation: CSS variables for every color, font, radius, spacing and duration; render slots, replaceable icons, i18n labels, class names.
- Icons are drawn for this package. No third-party icon code.

## Brand Commitments

Default look follows the lightGallery site's demo: full black backdrop, counter top-left, toolbar top-right, thumbnails at the bottom, caption above the thumbnails. Neutral by design so each project applies its own brand.

## Evidence on Hand

No real photos in this repo. The playground uses clearly labelled sample images. No usage numbers, adopters or benchmarks exist; do not invent them.

## Product Principles

1. The lightbox is the product; the grid is optional.
2. Nothing hardcoded that a project might want to change: text, icons, colors, timings.
3. Accessibility is a requirement, checked in a browser, not a claim.
4. Zero runtime dependencies and a measured bundle size.

## Accessibility & Inclusion

WCAG 2.2 AA. Dialog semantics with focus trap and focus return, labelled controls, live slide announcements, reduced motion, scroll lock.
