import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState, type ReactElement } from "react";
import { Lightbox, type LightboxProps, type Slide } from "../index";

/** Twelve landscape slides with responsive sources and captions. */
export const slides: Slide[] = Array.from({ length: 12 }, (_, i) => ({
  src: `/img/${i + 1}.jpg`,
  srcSet: `/img/${i + 1}-640.jpg 640w, /img/${i + 1}-1280.jpg 1280w`,
  width: 1600,
  height: 1000,
  alt: `Photo ${i + 1}`,
  title: `Title ${i + 1}`,
  thumbnail: `/img/${i + 1}-thumb.jpg`,
}));

/** Props of {@link Harness}: any lightbox prop plus the slides to show. */
export type HarnessProps = Partial<LightboxProps>;

/** Controlled page with one opener button per slide. */
export function Harness(props: HarnessProps): ReactElement {
  const [index, setIndex] = useState(-1);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const items = props.slides ?? slides;
  return (
    <>
      {items.map((slide, i) => (
        <button
          key={slide.src}
          ref={(el) => {
            buttons.current[i] = el;
          }}
          onClick={() => setIndex(i)}
        >
          open {i + 1}
        </button>
      ))}
      <Lightbox
        slides={items}
        open={index >= 0}
        index={Math.max(index, 0)}
        onIndexChange={setIndex}
        onClose={() => setIndex(-1)}
        getThumbnail={(i) => buttons.current[i]}
        {...props}
      />
    </>
  );
}

/** Renders {@link Harness} and opens slide `i`. */
export async function openAt(
  i: number,
  props: HarnessProps = {},
): Promise<{ user: ReturnType<typeof userEvent.setup>; dialog: HTMLElement }> {
  const user = userEvent.setup();
  render(<Harness {...props} />);
  await user.click(screen.getByRole("button", { name: `open ${i + 1}` }));
  return { user, dialog: await screen.findByRole("dialog") };
}
