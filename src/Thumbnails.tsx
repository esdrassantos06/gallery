import { useEffect, useRef, type ReactElement, type ReactNode } from "react";
import type { LightboxLabels, Slide } from "./types";

/** Props of {@link Thumbnails}. */
export interface ThumbnailsProps {
  slides: Slide[];
  active: number;
  labels: Pick<LightboxLabels, "thumbnails" | "thumbnail">;
  className: string;
  thumbnailClassName: string;
  renderThumbnail: ((slide: Slide, index: number, current: boolean) => ReactNode) | undefined;
  onSelect: (index: number) => void;
}

/**
 * Strip of thumbnail buttons. It scrolls natively and keeps the current
 * thumbnail centered whenever the slide changes.
 */
export function Thumbnails({
  slides,
  active,
  labels,
  className,
  thumbnailClassName,
  renderThumbnail,
  onSelect,
}: ThumbnailsProps): ReactElement {
  const trackRef = useRef<HTMLUListElement>(null);
  const firstRef = useRef(true);

  useEffect(() => {
    const track = trackRef.current;
    const button = track?.children[active]?.firstElementChild;
    if (!track || !(button instanceof HTMLElement) || typeof track.scrollTo !== "function") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: button.offsetLeft + button.offsetWidth / 2 - track.clientWidth / 2,
      behavior: firstRef.current || reduced ? "auto" : "smooth",
    });
    firstRef.current = false;
  }, [active]);

  return (
    <nav className={className} aria-label={labels.thumbnails}>
      <ul ref={trackRef} className="eg-thumbnails-track">
        {slides.map((slide, i) => {
          const current = i === active;
          return (
            <li key={i} className="eg-thumbnails-item">
              <button
                type="button"
                className={thumbnailClassName}
                aria-label={labels.thumbnail(i + 1, slides.length, slide)}
                aria-current={current || undefined}
                onClick={() => onSelect(i)}
              >
                {renderThumbnail ? (
                  renderThumbnail(slide, i, current)
                ) : (
                  <img
                    className="eg-thumbnail-image"
                    src={slide.thumbnail ?? slide.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
