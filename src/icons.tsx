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
  rotateLeft: (
    <Icon>
      <path d="M4.5 9.75h5.25V4.5" />
      <path d="M4.97 9.75A8.25 8.25 0 1 1 6.17 17.83" />
    </Icon>
  ),
  rotateRight: (
    <Icon>
      <path d="M19.5 9.75h-5.25V4.5" />
      <path d="M19.03 9.75a8.25 8.25 0 1 0-1.2 8.08" />
    </Icon>
  ),
  download: (
    <Icon>
      <path d="M12 3.75v11.25M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15" />
    </Icon>
  ),
  more: (
    <Icon>
      <path d="M6 12h.01M12 12h.01M18 12h.01" strokeWidth="2.5" />
    </Icon>
  ),
  flipHorizontal: (
    <Icon>
      <path d="M12 3v18M9 6.75 3.75 17.25H9zM15 6.75l5.25 10.5H15z" />
    </Icon>
  ),
  flipVertical: (
    <Icon>
      <path d="M3 12h18M6.75 9 17.25 3.75V9zM6.75 15l10.5 5.25V15z" />
    </Icon>
  ),
  share: (
    <Icon>
      <path d="M12 14.25V3.75M8.25 7.5 12 3.75l3.75 3.75" />
      <path d="M8.25 10.5H6.75a1.5 1.5 0 0 0-1.5 1.5v6.75a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V12a1.5 1.5 0 0 0-1.5-1.5h-1.5" />
    </Icon>
  ),
  linkCopied: (
    <Icon>
      <path d="M4.5 12.75 9.75 18 19.5 6" />
    </Icon>
  ),
};
