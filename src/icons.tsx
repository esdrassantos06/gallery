import type { ReactElement, ReactNode, SVGProps } from "react";
import type { LightboxIcons } from "./types";

/** Base for every built-in icon: 24px grid, 1.5px round stroke in `currentColor`. */
export function Icon({
  children,
  ...props
}: SVGProps<SVGSVGElement> & { children: ReactNode }): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="eg-icon"
      {...props}
    >
      {children}
    </svg>
  );
}

/**
 * Built-in icons from Mynaui Icons (https://mynaui.com/icons), MIT licensed,
 * copyright Praveen Juge. The two flip icons are drawn for this package in
 * the same style.
 */
export const defaultIcons: LightboxIcons = {
  close: (
    <Icon>
      <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  ),
  previous: (
    <Icon>
      <path d="m15 6-6 6 6 6" />
    </Icon>
  ),
  next: (
    <Icon>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  ),
  zoomIn: (
    <Icon>
      <path d="M9.5 11.5h4m-2-2v4m7.5-2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0m-2.107 5.42 3.08 3.08" />
    </Icon>
  ),
  zoomOut: (
    <Icon>
      <path d="M9.5 11.5h4m5.5 0a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0m-2.107 5.42 3.08 3.08" />
    </Icon>
  ),
  enterFullscreen: (
    <Icon>
      <path d="M9.4 21c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C3 17.96 3 16.84 3 14.6m18 0c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 21 16.84 21 14.6 21m0-18c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C21 6.04 21 7.16 21 9.4M9.4 3c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3 6.04 3 7.16 3 9.4" />
    </Icon>
  ),
  exitFullscreen: (
    <Icon>
      <path d="M9.75 3.01c-.04 2.79-.247 4.37-1.308 5.432C7.38 9.502 5.799 9.71 3.01 9.75M9.75 21c-.04-2.79-.247-4.371-1.308-5.432S5.799 14.3 3.01 14.26M14.26 3.01c.04 2.79.247 4.37 1.308 5.432C16.629 9.502 18.211 9.71 21 9.75M14.26 21c.04-2.79.247-4.371 1.308-5.432S18.211 14.3 21 14.26" />
    </Icon>
  ),
  playSlideshow: (
    <Icon>
      <path d="M14.581 9.402C16.194 10.718 17 11.375 17 12.5s-.806 1.783-2.419 3.098a23 23 0 0 1-1.292.99c-.356.25-.759.508-1.176.762-1.609.978-2.413 1.467-3.134.926-.722-.542-.787-1.675-.918-3.943A33 33 0 0 1 8 12.5c0-.563.023-1.192.06-1.833.132-2.267.197-3.401.919-3.943.721-.541 1.525-.052 3.134.926.417.254.82.512 1.176.762a23 23 0 0 1 1.292.99" />
    </Icon>
  ),
  pauseSlideshow: (
    <Icon>
      <path d="M9 6.5H8a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-10a1 1 0 0 0-1-1m6.5 0h-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-10a1 1 0 0 0-1-1" />
    </Icon>
  ),
  rotateLeft: (
    <Icon>
      <path d="M5.636 18.364A9 9 0 1 0 12 3C7.942 3 5.482 5.705 3 8.5" />
      <path d="M3 4.5v4h4" />
    </Icon>
  ),
  rotateRight: (
    <Icon>
      <path d="M18.364 18.364A9 9 0 1 1 12 3c4.058 0 6.518 2.705 9 5.5" />
      <path d="M21 4.5v4h-4" />
    </Icon>
  ),
  download: (
    <Icon>
      <path d="M4 16.004V17a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1M12 4.5v11m3.5-3.5L12 15.5 8.5 12" />
    </Icon>
  ),
  more: (
    <Icon>
      <path d="M12 12.313v-.626m5 .626v-.626m-10 .626v-.626" />
    </Icon>
  ),
  flipHorizontal: (
    <Icon>
      <path d="M12 3v1.5M12 7.5v3M12 13.5v3M12 19.5V21" />
      <path d="M9 6.5 3.5 17.5H9zM15 6.5l5.5 11H15z" />
    </Icon>
  ),
  flipVertical: (
    <Icon>
      <path d="M3 12h1.5M7.5 12h3M13.5 12h3M19.5 12H21" />
      <path d="M6.5 9 17.5 3.5V9zM6.5 15l11 5.5V15z" />
    </Icon>
  ),
  share: (
    <Icon>
      <path d="M9.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0m5-5.5-5 3.5m5 7.5-5-3.5m10 4.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0m0-13a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
    </Icon>
  ),
  linkCopied: (
    <Icon>
      <path d="m6 13.626 1.606 1.722c.886.95 1.329 1.424 1.825 1.574.436.131.9.096 1.315-.1.473-.224.852-.761 1.612-1.836L18 7" />
    </Icon>
  ),
};
