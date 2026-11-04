import { useRef } from "react";
import { Lightbox, useLightboxHash } from "liftbox";
import "liftbox/styles.css";

const base = "https://liftbox.digital/samples";
const sizes = [
  [1600, 1067],
  [1067, 1600],
  [1600, 1600],
  [1600, 900],
  [1280, 1600],
  [1600, 1067],
];

const slides = sizes.map(([width, height], i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    src: `${base}/sample-${n}-full.jpg`,
    thumbnail: `${base}/sample-${n}-thumb.jpg`,
    width,
    height,
    alt: `Sample ${n}, an abstract colour field`,
    title: `Sample ${n}`,
  };
});

/** A cropped thumbnail grid that opens the lightbox out of the clicked image. */
export function Gallery() {
  const thumbnails = useRef([]);
  const [index, setIndex] = useLightboxHash("photo", { count: slides.length });

  return (
    <>
      <div className="grid">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            ref={(el) => {
              thumbnails.current[i] = el;
            }}
            onClick={() => setIndex(i)}
            aria-label={`Open ${slide.alt}`}
          >
            <img src={slide.thumbnail} alt="" />
          </button>
        ))}
      </div>
      <Lightbox
        slides={slides}
        open={index >= 0}
        index={Math.max(index, 0)}
        onIndexChange={setIndex}
        onClose={() => setIndex(-1)}
        getThumbnail={(i) => thumbnails.current[i]}
      />
    </>
  );
}
