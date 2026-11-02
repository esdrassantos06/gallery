# Roadmap

Phases ship one at a time. Each one ends with unit, integration and end-to-end tests, a working playground and updated docs.

| Phase | Scope                                                                                                                                                                                                         | Status  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1     | Core lightbox: open and close flight, navigation, keyboard, swipe, transitions, captions, preloading, `srcset`, focus management, scroll lock                                                                 | Done    |
| 2     | Thumbnail strip, zoom (wheel, double click, double tap, pinch, pan, buttons, keys), fullscreen, image loading and error states                                                                                | Done    |
| 3     | Video slides (MP4, YouTube through `youtube-nocookie.com`, Vimeo), custom iframe slides, slideshow with progress bar                                                                                          | Done    |
| 4     | Hash deep linking with back-button close, rotation and flip, download                                                                                                                                         | Planned |
| 5     | Optional grids (masonry, justified, uniform) and a category filter, all usable without the lightbox and vice versa                                                                                            | Planned |
| 6     | Interaction polish: toolbar overflow menu on narrow screens, idle-hiding controls, right-to-left layouts, pinch to close, Web Share, pager dots, caption placement inside the slide, cropped-thumbnail flight | Planned |
| 7     | Release: CI on React 18 and 19, npm Trusted Publishing through OIDC, integration in the ModuloService site, first-publish guide                                                                               | Planned |

## Considered and left out

These exist in the `lightbox` project this package grew from and are deliberately not planned:

- **Comment panels (Facebook, Disqus):** need third-party scripts, which breaks the no-CDN, strict CSP promise.
- **Vimeo thumbnails through oEmbed:** a runtime request to a third party just to draw a poster. Consumers can pass `thumbnail` themselves.
- **Wistia:** needs its player script.
- **Medium-style zoom mode:** a second viewing mode with its own rules; the flight animation already covers the "zoom from the page" feel.
