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

/** Built-in icons, drawn for this package. */
export const defaultIcons: LightboxIcons = {
  close: (
    <Icon>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  ),
  previous: (
    <Icon>
      <path d="M15 4.5L7.5 12l7.5 7.5" />
    </Icon>
  ),
  next: (
    <Icon>
      <path d="M9 4.5l7.5 7.5L9 19.5" />
    </Icon>
  ),
  zoomIn: (
    <Icon>
      <circle cx="10.5" cy="10.5" r="6.75" />
      <path d="M15.3 15.3 20.25 20.25M10.5 7.5v6M7.5 10.5h6" />
    </Icon>
  ),
  zoomOut: (
    <Icon>
      <circle cx="10.5" cy="10.5" r="6.75" />
      <path d="M15.3 15.3 20.25 20.25M7.5 10.5h6" />
    </Icon>
  ),
  enterFullscreen: (
    <Icon>
      <path d="M3.75 8.25v-4.5h4.5M15.75 3.75h4.5v4.5M20.25 15.75v4.5h-4.5M8.25 20.25h-4.5v-4.5" />
    </Icon>
  ),
  exitFullscreen: (
    <Icon>
      <path d="M8.25 3.75v4.5h-4.5M20.25 8.25h-4.5v-4.5M15.75 20.25v-4.5h4.5M3.75 15.75h4.5v4.5" />
    </Icon>
  ),
  playSlideshow: (
    <Icon>
      <path d="M7.5 5.25v13.5L18.75 12z" />
    </Icon>
  ),
  pauseSlideshow: (
    <Icon>
      <path d="M8.25 5.25v13.5M15.75 5.25v13.5" />
    </Icon>
  ),
};
