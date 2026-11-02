import type { CSSProperties, ReactNode } from "react";

/** One item shown in the lightbox. */
export interface Slide {
  /** Image URL. Used as `<img src>` and as the fallback when `srcSet` has no better match. */
  src: string;
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
  /** Small preview image for the thumbnail strip. Falls back to `src`, which downloads the full image. */
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
  /** The thumbnail strip, `.eg-thumbnails`. */
  thumbnails: string;
  /** Each thumbnail button, `.eg-thumbnail`. */
  thumbnail: string;
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
  /** Caption of the current slide. Return `null` to hide it. */
  caption?: ((slide: Slide, index: number) => ReactNode) | undefined;
  /** Counter in the top left corner. Numbers are 1-based. */
  counter?: ((current: number, total: number) => ReactNode) | undefined;
  /**
   * Toolbar in the top right corner. Receives the built-in buttons, the current
   * slide and its index, so extra actions can act on what is on screen.
   */
  toolbar?: ((buttons: ReactNode, slide: Slide, index: number) => ReactNode) | undefined;
  /** Content of one thumbnail button. Its accessible name still comes from `labels.thumbnail`. */
  thumbnail?: ((slide: Slide, index: number, current: boolean) => ReactNode) | undefined;
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
  /** Called when the user asks to close: Escape, the close button, a backdrop click or a downward swipe. Set `open` to false in response. */
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
   * How many slides on each side of the current one are mounted, and therefore
   * loaded. Slides outside this window are not in the DOM.
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
   * Arrow keys, Home and End navigate; Escape closes; `+`, `-` and `0` zoom.
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
