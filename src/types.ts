import type { CSSProperties, ReactNode } from "react";

/** One source of a video slide, for `<source>`. */
export interface VideoSource {
  /** File URL. */
  src: string;
  /** MIME type, for example `video/webm`, so the browser can skip formats it cannot play. */
  type?: string | undefined;
}

/** A text track of a video slide, for `<track>`. */
export interface VideoTrack {
  /** WebVTT file URL. */
  src: string;
  /** Language of the track, for example `pt`. */
  srcLang: string;
  /** Name shown in the player's track menu. */
  label: string;
  /**
   * What the track contains.
   * @defaultValue "captions"
   */
  kind?: "captions" | "subtitles" | "descriptions" | "chapters" | undefined;
  /** Turn this track on unless the user picked another one. */
  default?: boolean | undefined;
}

/** One item shown in the lightbox: an image, a video file, a YouTube or Vimeo link, or any page in an iframe. */
export interface Slide {
  /**
   * What to show. An image URL by default; a video file (`.mp4`, `.webm`, `.ogv`,
   * `.mov`, `.m4v`); a YouTube or Vimeo link, embedded without third-party scripts;
   * or, with `type: "iframe"`, any page.
   */
  src: string;
  /**
   * How the slide renders. When omitted it is detected from `src`: YouTube and
   * Vimeo links embed, video file extensions play natively, anything else is an image.
   */
  type?: "image" | "video" | "iframe" | undefined;
  /** Still image shown before a video plays, and in place of embeds on neighboring slides. */
  poster?: string | undefined;
  /** Alternative files for a video slide, in order of preference. `src` is used when omitted. */
  sources?: VideoSource[] | undefined;
  /** Captions, subtitles or descriptions for a video slide. */
  tracks?: VideoTrack[] | undefined;
  /**
   * What the download button saves: a URL to use instead of `src`, for example
   * the original file, or `false` to hide the button on this slide.
   */
  download?: string | false | undefined;
  /** File name for the download. Wins over `download.filename`. */
  downloadName?: string | undefined;
  /** Responsive candidates for `<img srcset>`, for example `"a-640.jpg 640w, a-1280.jpg 1280w"`. */
  srcSet?: string | undefined;
  /**
   * Layout hint passed to `<img sizes>` when `srcSet` is set.
   * @defaultValue the width the image is rendered at, in px, once the stage is measured
   */
  sizes?: string | undefined;
  /**
   * Natural width in px. With `height`, lets the lightbox size the image before
   * it loads, which avoids layout shift and makes the open animation exact.
   */
  width?: number | undefined;
  /** Natural height in px. See {@link Slide.width}. */
  height?: number | undefined;
  /** Alternative text for the image. Also used by the default announcement when there is no string `title`. */
  alt?: string | undefined;
  /** Caption heading, rendered as an `h2`. */
  title?: ReactNode | undefined;
  /** Caption text below the title. */
  description?: ReactNode | undefined;
  /**
   * Small preview image for the grids, the thumbnail strip and the placeholder
   * shown while the full image loads. Falls back to `poster`, then to `src` for
   * images, which downloads the full file. Videos without either show no preview.
   * The placeholder covers the image box; when thumbnails are cropped to another
   * shape, set `--eg-placeholder-size` to `contain`, or to `0 0` to hide it.
   */
  thumbnail?: string | undefined;
}

/**
 * How one slide replaces another.
 * - `slide`: slides move sideways, following the finger while dragging.
 * - `fade`: the current slide fades into the next one.
 * - `zoom`: the next slide grows in while the current one fades out.
 */
export type Transition = "slide" | "fade" | "zoom";

/** Every user-facing string. Override any of them for translations. */
export interface LightboxLabels {
  /** Accessible name of the dialog. */
  dialog: string;
  /** Accessible name of the close button. */
  close: string;
  /** Accessible name of the previous arrow. */
  previous: string;
  /** Accessible name of the next arrow. */
  next: string;
  /** Visible counter text, for example `3 / 12`. Both numbers are 1-based. */
  counter: (current: number, total: number) => string;
  /** Text of the polite live region, read by screen readers when the slide changes. Numbers are 1-based. */
  announcement: (current: number, total: number, slide: Slide) => string;
  /** Accessible name of the thumbnail strip. */
  thumbnails: string;
  /** Accessible name of one thumbnail button. Numbers are 1-based. */
  thumbnail: (index: number, total: number, slide: Slide) => string;
  /** Accessible name of the zoom in button. */
  zoomIn: string;
  /** Accessible name of the zoom out button. */
  zoomOut: string;
  /** Accessible name of the fullscreen button while not in fullscreen. */
  enterFullscreen: string;
  /** Accessible name of the fullscreen button while in fullscreen. */
  exitFullscreen: string;
  /** Message shown in place of an image that failed to load. */
  loadError: string;
  /** Accessible name of the slideshow button while stopped. */
  playSlideshow: string;
  /** Accessible name of the slideshow button while playing. */
  pauseSlideshow: string;
  /** Accessible name for a video or embed whose slide has no `alt` or string `title`. */
  video: string;
  /** Accessible name of the rotate left button. */
  rotateLeft: string;
  /** Accessible name of the rotate right button. */
  rotateRight: string;
  /** Accessible name of the download button. */
  download: string;
  /** Announced when a file could not be saved directly and opened in a new tab instead. */
  downloadError: string;
  /** Accessible name of the button and menu that hold the toolbar buttons that do not fit. */
  more: string;
  /** Accessible name of the flip horizontally button. */
  flipHorizontal: string;
  /** Accessible name of the flip vertically button. */
  flipVertical: string;
  /** Accessible name of the share button. */
  share: string;
  /** Announced when the link was copied because the share sheet is not available. */
  linkCopied: string;
  /** Announced when the link could neither be shared nor copied. */
  shareError: string;
  /** Accessible name of the pager dots. */
  pager: string;
  /** Accessible name of one pager dot. Numbers are 1-based. */
  pagerItem: (index: number, total: number, slide: Slide) => string;
}

/** Icons of the built-in buttons. Each one can be replaced by any React node. */
export interface LightboxIcons {
  /** Icon of the close button. */
  close: ReactNode;
  /** Icon of the previous arrow. */
  previous: ReactNode;
  /** Icon of the next arrow. */
  next: ReactNode;
  /** Icon of the zoom in button. */
  zoomIn: ReactNode;
  /** Icon of the zoom out button. */
  zoomOut: ReactNode;
  /** Icon of the fullscreen button while not in fullscreen. */
  enterFullscreen: ReactNode;
  /** Icon of the fullscreen button while in fullscreen. */
  exitFullscreen: ReactNode;
  /** Icon of the slideshow button while stopped. */
  playSlideshow: ReactNode;
  /** Icon of the slideshow button while playing. */
  pauseSlideshow: ReactNode;
  /** Icon of the rotate left button. */
  rotateLeft: ReactNode;
  /** Icon of the rotate right button. */
  rotateRight: ReactNode;
  /** Icon of the download button. */
  download: ReactNode;
  /** Icon of the button that opens the overflow menu. */
  more: ReactNode;
  /** Icon of the flip horizontally button. */
  flipHorizontal: ReactNode;
  /** Icon of the flip vertically button. */
  flipVertical: ReactNode;
  /** Icon of the share button. */
  share: ReactNode;
  /** Icon of the share button for a moment after the link was copied. */
  linkCopied: ReactNode;
}

/** Extra class names, added next to the built-in `eg-*` class of each part. */
export interface LightboxClassNames {
  /** The dialog element, `.eg-root`. */
  root: string;
  /** The full-screen background, `.eg-backdrop`. */
  backdrop: string;
  /** The bar holding the counter and the toolbar, `.eg-top-bar`. */
  topBar: string;
  /** The slide counter, `.eg-counter`. */
  counter: string;
  /** The button group in the top right corner, `.eg-toolbar`. */
  toolbar: string;
  /** Every built-in button, `.eg-button`. */
  button: string;
  /** The previous and next arrows, `.eg-arrow`. */
  arrow: string;
  /** The area that holds the slides and receives swipes, `.eg-stage`. */
  stage: string;
  /** Each mounted slide, `.eg-slide`. */
  slide: string;
  /** Each built-in image, `.eg-image`. */
  image: string;
  /** The caption of the current slide, `.eg-caption`. */
  caption: string;
  /** With `captionPosition="slide"`, the box laid over each media that holds its caption, `.eg-slide-caption`. */
  slideCaption: string;
  /** The thumbnail strip, `.eg-thumbnails`. */
  thumbnails: string;
  /** Each thumbnail button, `.eg-thumbnail`. */
  thumbnail: string;
  /** Each native video, `.eg-video`. */
  video: string;
  /** Each YouTube, Vimeo or custom iframe, `.eg-embed`. */
  embed: string;
  /** The slideshow progress bar, `.eg-progress`. */
  progress: string;
  /** The overflow menu, `.eg-menu`. */
  menu: string;
  /** Each item of the overflow menu, `.eg-menu-item`. */
  menuItem: string;
  /** The pager dots, `.eg-pager`. */
  pager: string;
  /** Each pager dot, `.eg-pager-dot`. */
  pagerDot: string;
}

/** Arguments given to {@link LightboxRender.slide}. */
export interface RenderSlideProps {
  /** The slide to render. */
  slide: Slide;
  /** Its position in `slides`. */
  index: number;
  /** Whether this is the visible slide. Neighbors are mounted too, for preloading. */
  current: boolean;
  /** Width in px the media should take to fit the stage, or the stage width when the natural size is unknown. */
  width: number;
  /** Height in px the media should take to fit the stage, or the stage height when the natural size is unknown. */
  height: number;
}

/** Render overrides. Each function replaces one built-in part. */
export interface LightboxRender {
  /** Content of one slide. Return `undefined` to keep the built-in image. */
  slide?: ((props: RenderSlideProps) => ReactNode) | undefined;
  /**
   * Caption of the current slide, or of every mounted slide with
   * `captionPosition="slide"`. Return `null` to hide it.
   */
  caption?: ((slide: Slide, index: number) => ReactNode) | undefined;
  /** Counter in the top left corner. Numbers are 1-based. */
  counter?: ((current: number, total: number) => ReactNode) | undefined;
  /**
   * Toolbar in the top right corner. Receives the built-in buttons, the current
   * slide and its index, so extra actions can act on what is on screen.
   */
  toolbar?: ((buttons: ReactNode, slide: Slide, index: number) => ReactNode) | undefined;
  /**
   * Content of one thumbnail button. Its accessible name still comes from
   * `labels.thumbnail`. Past 100 slides the strip only renders the thumbnails in
   * view and assumes they all share one width, set by `--eg-thumbnail-width`.
   */
  thumbnail?: ((slide: Slide, index: number, current: boolean) => ReactNode) | undefined;
}

/** Options for video slides. */
export interface VideoOptions {
  /**
   * Start the current video or embed on its own, muted, as browsers require.
   * @defaultValue false
   */
  autoplay?: boolean | undefined;
}

/** Options for the `download` prop. */
export interface DownloadOptions {
  /** File name for a slide. Defaults to the last segment of the URL. `slide.downloadName` wins. */
  filename?: ((slide: Slide, index: number) => string) | undefined;
  /**
   * Called when a cross-origin file could not be fetched (network, CORS or an
   * HTTP error). The file is then opened in a new tab instead.
   */
  onError?: ((error: unknown, slide: Slide) => void) | undefined;
}

/** Options for the `share` prop. */
export interface ShareOptions {
  /**
   * Link to share for a slide. Pair the default with `useLightboxHash` so the
   * link opens this slide.
   * @defaultValue the page URL, `window.location.href`
   */
  url?: ((slide: Slide, index: number) => string) | undefined;
}

/** Options for the `slideshow` prop. */
export interface SlideshowOptions {
  /**
   * Time each slide stays on screen, in ms.
   * @defaultValue 5000
   */
  interval?: number | undefined;
  /**
   * Start playing as soon as the lightbox opens.
   * @defaultValue false
   */
  autoplay?: boolean | undefined;
  /**
   * Show a progress bar for the time left on the current slide.
   * @defaultValue true
   */
  progress?: boolean | undefined;
}

/** Fine-tuning for the `zoom` prop. Scales are relative to the fitted image. */
export interface ZoomOptions {
  /**
   * Smallest scale. Values below 1 let the user shrink the image under its fitted size.
   * @defaultValue 1
   */
  minScale?: number | undefined;
  /**
   * Largest scale.
   * @defaultValue 3
   */
  maxScale?: number | undefined;
  /**
   * Factor applied by the zoom buttons and the `+` and `-` keys.
   * @defaultValue 1.5
   */
  step?: number | undefined;
  /**
   * Scale reached by a double click or double tap.
   * @defaultValue 2
   */
  doubleTapScale?: number | undefined;
  /**
   * Zoom with the mouse wheel and trackpad pinch.
   * @defaultValue true
   */
  wheel?: boolean | undefined;
}

/** Props of the `Lightbox` component. */
export interface LightboxProps {
  /** Items to show, in order. */
  slides: Slide[];
  /** Whether the lightbox is shown. Setting it to false plays the exit animation before unmounting. */
  open: boolean;
  /**
   * Current slide. Read when opening and whenever it changes while open.
   * @defaultValue 0
   */
  index?: number | undefined;
  /** Called when the user asks to close: Escape, the close button, a backdrop click, a downward swipe or a pinch to close. Set `open` to false in response. */
  onClose: () => void;
  /** Called with the new index whenever the user changes slide. */
  onIndexChange?: ((index: number) => void) | undefined;
  /** Called once the open animation has finished. */
  onAfterOpen?: (() => void) | undefined;
  /** Called once the close animation has finished and focus was returned. */
  onAfterClose?: (() => void) | undefined;
  /**
   * Wrap from the last slide to the first and back. When false, the arrows are
   * disabled at the ends.
   * @defaultValue true
   */
  loop?: boolean | undefined;
  /**
   * Slide change animation. Its length is `--eg-duration`.
   * @defaultValue "slide"
   */
  transition?: Transition | undefined;
  /**
   * Where captions go. `"bar"` is a band across the bottom of the viewer.
   * `"slide"` lays each caption over the bottom of its own media, so it moves
   * with the slide.
   * @defaultValue "bar"
   */
  captionPosition?: "bar" | "slide" | undefined;
  /**
   * How many slides on each side of the current one are mounted. Slides outside
   * this window are not in the DOM. Neighbors start loading once the current
   * image has, at low priority; on a 3G connection or a device with 2 GB of
   * memory or less only one is kept on each side, and with Save-Data or 2G
   * neighbors are not fetched before they are shown.
   * @defaultValue 2
   */
  preload?: number | undefined;
  /**
   * Close when the empty area around the media is clicked.
   * @defaultValue true
   */
  closeOnBackdropClick?: boolean | undefined;
  /**
   * Swipe or drag sideways to change slide, and up or down to close.
   * @defaultValue true
   */
  swipe?: boolean | undefined;
  /**
   * Horizontal travel in px that changes slide on release. Quick flicks change
   * slide with less travel.
   * @defaultValue 50
   */
  swipeThreshold?: number | undefined;
  /**
   * Arrow keys, Home and End navigate (mirrored in `rtl`); Escape closes; `+`, `-` and `0` zoom.
   * @defaultValue true
   */
  keyboard?: boolean | undefined;
  /**
   * Show the strip of thumbnails at the bottom.
   * @defaultValue true
   */
  thumbnails?: boolean | undefined;
  /**
   * Zoom with the wheel, double click, double tap, pinch, the toolbar buttons
   * and the `+`, `-` and `0` keys. Pass options to tune it, or `false` to turn it off.
   * Only built-in images zoom; slides from `render.slide` do not.
   * @defaultValue true
   */
  zoom?: boolean | ZoomOptions | undefined;
  /**
   * Show a fullscreen button where the Fullscreen API is available.
   * @defaultValue true
   */
  fullscreen?: boolean | undefined;
  /**
   * Add rotate left and right buttons for images. Rotation turns in 90 degree
   * steps, keeps working with zoom and resets on slide change and with the `0` key.
   * @defaultValue false
   */
  rotate?: boolean | undefined;
  /**
   * Add a download button for images and video files. Same-origin files are
   * saved directly; cross-origin files are fetched so the name is kept, and open
   * in a new tab when the server does not allow it.
   * @defaultValue false
   */
  download?: boolean | DownloadOptions | undefined;
  /**
   * Add flip horizontally and vertically buttons for images. Flips mirror the
   * image across the screen axis, also when rotated, keep working with zoom and
   * reset on slide change and with the `0` key.
   * @defaultValue false
   */
  flip?: boolean | undefined;
  /**
   * Add a share button. It opens the system share sheet through `navigator.share`
   * where available and copies the link otherwise. No third-party script is loaded.
   * The button is hidden where neither is possible, for example over plain `http`.
   * @defaultValue false
   */
  share?: boolean | ShareOptions | undefined;
  /**
   * Move toolbar buttons that do not fit beside the counter into a "More options"
   * menu. Zoom goes first, as gestures do the same; close always stays visible.
   * @defaultValue true
   */
  toolbarOverflow?: boolean | undefined;
  /**
   * Hide the top bar, arrows, caption, thumbnails and pager after this many ms
   * without pointer, touch or keyboard input (`true` means 3000). They stay while
   * a control has keyboard focus or the pointer rests on one.
   * @defaultValue false
   */
  idle?: boolean | number | undefined;
  /**
   * Show a row of dots, one per slide, as a lighter alternative or complement
   * to the thumbnails. Best for short galleries.
   * @defaultValue false
   */
  pager?: boolean | undefined;
  /**
   * Close when a pinch shrinks the image under its fitted size and lets go. A
   * pinch that zoomed in first never closes. Needs `zoom`.
   * @defaultValue true
   */
  pinchToClose?: boolean | undefined;
  /**
   * Text direction. In `rtl` the arrows, swipes, arrow keys, thumbnails, pager
   * and toolbar are mirrored, so the next slide comes from the left.
   * @defaultValue the direction of `container`, usually inherited from `<html dir>`
   */
  dir?: "ltr" | "rtl" | undefined;
  /** Options for video slides. See {@link VideoOptions}. */
  video?: VideoOptions | undefined;
  /**
   * Add a slideshow button that advances on a timer. It pauses when the user
   * navigates by hand, while the page is hidden, and on video slides until the
   * video ends. Pass options to tune it.
   * @defaultValue false
   */
  slideshow?: boolean | SlideshowOptions | undefined;
  /**
   * Returns the element that opened a slide, usually its thumbnail. The open and
   * close animations start and end there, and focus goes back to it on close.
   * Without it, focus goes back to the element that was focused before opening.
   */
  getThumbnail?: ((index: number) => HTMLElement | null | undefined) | undefined;
  /** Replaces any of the {@link LightboxLabels} strings. */
  labels?: Partial<LightboxLabels> | undefined;
  /** Replaces any of the {@link LightboxIcons}. */
  icons?: Partial<LightboxIcons> | undefined;
  /** Adds class names to any of the {@link LightboxClassNames} parts. */
  classNames?: Partial<LightboxClassNames> | undefined;
  /** Replaces built-in parts. See {@link LightboxRender}. */
  render?: LightboxRender | undefined;
  /** Extra class on the root element. */
  className?: string | undefined;
  /** Inline style on the root element. Handy for `--eg-*` variables. */
  style?: CSSProperties | undefined;
  /**
   * Element the dialog is portalled into.
   * @defaultValue document.body
   */
  container?: HTMLElement | null | undefined;
}

/** A value, or a function that returns it from the grid's measured width in px. */
export type Responsive<T> = T | ((containerWidth: number) => T);

/** Strings of the grids. Override any of them for translations. */
export interface GridLabels {
  /** Accessible name of the button that opens a slide. Numbers are 1-based. */
  open: (index: number, total: number, slide: Slide) => string;
}

/** Extra class names, added next to the built-in `eg-*` class of each grid part. */
export interface GridClassNames {
  /** The list, `.eg-grid`. */
  root: string;
  /** Each list item, `.eg-grid-item`. */
  item: string;
  /** Each button that opens a slide, `.eg-grid-button`. */
  button: string;
  /** Each built-in image, `.eg-grid-image`. */
  image: string;
}

/** Arguments given to {@link GridRender.image}. */
export interface RenderGridImageProps {
  /** The slide to draw. */
  slide: Slide;
  /** Its position in `slides`. */
  index: number;
  /** Width of the item in px. */
  width: number;
  /** Height of the item in px. */
  height: number;
  /** Value for `<img sizes>`: the item width, for example `320px`. */
  sizes: string;
}

/** Render overrides of the grids. */
export interface GridRender {
  /**
   * Content of one item, for example a framework image component. It fills the
   * item, which is positioned, so `fill`-style images work. Return `undefined`
   * to keep the built-in image.
   */
  image?: ((props: RenderGridImageProps) => ReactNode) | undefined;
}

/** What a grid exposes through its `ref`. */
export interface GridHandle {
  /** The button of slide `index`, or `null`. Pass it to the `Lightbox` `getThumbnail` prop. */
  getThumbnail: (index: number) => HTMLElement | null;
}

/** Props shared by every grid. */
export interface GridProps {
  /** Items to show, in order. Their `width` and `height` set each item's shape. */
  slides: Slide[];
  /**
   * Called with the index of the clicked slide. When omitted, items are plain
   * images with their `alt` text instead of buttons.
   */
  onOpen?: ((index: number) => void) | undefined;
  /**
   * Space between items, in px.
   * @defaultValue 8
   */
  gap?: Responsive<number> | undefined;
  /**
   * Width in px used on the server and before the grid is measured. Set it to
   * the width the grid usually has to avoid a reflow on load.
   * @defaultValue 1024
   */
  defaultContainerWidth?: number | undefined;
  /** Replaces any of the {@link GridLabels} strings. */
  labels?: Partial<GridLabels> | undefined;
  /** Adds class names to any of the {@link GridClassNames} parts. */
  classNames?: Partial<GridClassNames> | undefined;
  /** Replaces built-in parts. See {@link GridRender}. */
  render?: GridRender | undefined;
  /** Extra class on the list. */
  className?: string | undefined;
  /** Inline style on the list. Handy for `--eg-grid-*` variables. */
  style?: CSSProperties | undefined;
}

/** Props of `MasonryGrid`. */
export interface MasonryGridProps extends GridProps {
  /**
   * Number of columns.
   * @defaultValue 2 below 640px, 3 below 1024px, 4 from there
   */
  columns?: Responsive<number> | undefined;
}

/** Props of `JustifiedGrid`. */
export interface JustifiedGridProps extends GridProps {
  /**
   * Row height to aim for, in px. Rows end up a little shorter or taller so they fill the width.
   * @defaultValue 180 below 640px, 260 from there
   */
  rowHeight?: Responsive<number> | undefined;
  /**
   * What to do with the leftover items that cannot fill the last row: keep them
   * at `rowHeight` (`start`), stretch them like the other rows (`justify`) or leave them out (`hide`).
   * @defaultValue "start"
   */
  lastRow?: "start" | "justify" | "hide" | undefined;
}

/** Props of `UniformGrid`. */
export interface UniformGridProps extends GridProps {
  /**
   * Number of columns.
   * @defaultValue 2 below 640px, 3 below 1024px, 4 from there
   */
  columns?: Responsive<number> | undefined;
  /**
   * Shape of every item, width / height. Images are cropped to fill it.
   * @defaultValue 1
   */
  aspectRatio?: number | undefined;
}

/** Strings of `GalleryFilter`. Override any of them for translations. */
export interface FilterLabels<T extends string = string> {
  /** Accessible name of the group of buttons. */
  group: string;
  /** Text of the button that shows every item. */
  all: string;
  /** Text of the button of one category. */
  category: (category: T) => string;
  /** Text of the polite live region, read by screen readers when the visible count changes. */
  count: (count: number) => string;
}

/** Extra class names, added next to the built-in `eg-*` class of each filter part. */
export interface FilterClassNames {
  /** The wrapper, `.eg-filter`. */
  root: string;
  /** The group of buttons, `.eg-filter-group`. */
  group: string;
  /** Each button, `.eg-filter-button`. */
  button: string;
  /** The visually hidden live region, `.eg-filter-status`. */
  status: string;
}

/** Props of `GalleryFilter`. */
export interface GalleryFilterProps<T extends string = string> {
  /** Categories to offer, in order. An "All" button comes first. */
  categories: readonly T[];
  /** The selected category, or `null` for all. */
  value: T | null;
  /** Called with the chosen category, or `null` when "All" is chosen. */
  onChange: (value: T | null) => void;
  /** Number of items visible with the current selection, announced when it changes. */
  count: number;
  /** Replaces any of the {@link FilterLabels} strings. */
  labels?: Partial<FilterLabels<T>> | undefined;
  /** Adds class names to any of the {@link FilterClassNames} parts. */
  classNames?: Partial<FilterClassNames> | undefined;
  /** Extra class on the wrapper. */
  className?: string | undefined;
  /** Inline style on the wrapper. Handy for `--eg-filter-*` variables. */
  style?: CSSProperties | undefined;
}
