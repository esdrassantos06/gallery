import type { ReactElement } from "react";
import { cx } from "./dom";
import { defaultFilterLabels } from "./labels";
import type { FilterLabels, GalleryFilterProps } from "./types";

/**
 * Category filter: a labelled group of toggle buttons with an "All" option and
 * a polite live region that announces how many items are visible. It only
 * reports the choice; filter the slides yourself and pass the same filtered
 * list to the grid and the `Lightbox`, so their indices match.
 */
export function GalleryFilter<T extends string>({
  categories,
  value,
  onChange,
  count,
  labels,
  classNames = {},
  className,
  style,
}: GalleryFilterProps<T>): ReactElement {
  const text: FilterLabels<T> = { ...defaultFilterLabels, ...labels };
  return (
    <div className={cx("eg-filter", classNames.root, className)} style={style}>
      <div role="group" aria-label={text.group} className={cx("eg-filter-group", classNames.group)}>
        {[null, ...categories].map((category, i) => (
          <button
            key={i}
            type="button"
            className={cx("eg-filter-button", classNames.button)}
            aria-pressed={value === category}
            onClick={() => onChange(category)}
          >
            {category === null ? text.all : text.category(category)}
          </button>
        ))}
      </div>
      <p className={cx("eg-filter-status", classNames.status)} aria-live="polite">
        {text.count(count)}
      </p>
    </div>
  );
}
