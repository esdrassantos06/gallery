import type { FilterLabels, GridLabels, LightboxLabels } from "./types";

/** English defaults. Pass `labels` to translate any of them. */
export const defaultLabels: LightboxLabels = {
  dialog: "Image viewer",
  close: "Close",
  previous: "Previous image",
  next: "Next image",
  counter: (current, total) => `${current} / ${total}`,
  announcement: (current, total, slide) => {
    const name = typeof slide.title === "string" ? slide.title : slide.alt;
    return name ? `Image ${current} of ${total}: ${name}` : `Image ${current} of ${total}`;
  },
  thumbnails: "Thumbnails",
  thumbnail: (index) => `Show image ${index}`,
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  enterFullscreen: "Enter fullscreen",
  exitFullscreen: "Exit fullscreen",
  loadError: "This image could not be loaded.",
  playSlideshow: "Start slideshow",
  pauseSlideshow: "Pause slideshow",
  video: "Video",
  rotateLeft: "Rotate left",
  rotateRight: "Rotate right",
  download: "Download",
  downloadError: "This file could not be downloaded here, so it opened in a new tab.",
  more: "More options",
  flipHorizontal: "Flip horizontally",
  flipVertical: "Flip vertically",
  share: "Share",
  linkCopied: "Link copied",
  shareError: "This link could not be shared.",
  pager: "Slides",
  pagerItem: (index) => `Go to image ${index}`,
};

/** English defaults of the grids. */
export const defaultGridLabels: GridLabels = {
  open: (index, _total, slide) => {
    const name = slide.alt || (typeof slide.title === "string" ? slide.title : "");
    return name ? `Open ${name}` : `Open image ${index}`;
  },
};

/** English defaults of `GalleryFilter`. */
export const defaultFilterLabels: FilterLabels = {
  group: "Filter",
  all: "All",
  category: (category) => category,
  count: (count) => (count === 1 ? "1 image" : `${count} images`),
};
