import type { LightboxLabels } from "./types";

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
};
