import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { openAt, slides } from "./test/harness";

const image = (alt: string) => screen.getByAltText(alt);

describe("image loading", () => {
  it("fetches the current image first and holds the neighbors until it settles", async () => {
    await openAt(5, { preload: 1 });
    expect(image("Photo 6")).toHaveAttribute("fetchpriority", "high");
    expect(image("Photo 6")).toHaveAttribute("src", "/img/6.jpg");
    for (const alt of ["Photo 5", "Photo 7"]) {
      expect(image(alt)).not.toHaveAttribute("src");
      expect(image(alt)).not.toHaveAttribute("srcset");
    }
    fireEvent.load(image("Photo 6"));
    expect(image("Photo 5")).toHaveAttribute("src", "/img/5.jpg");
    expect(image("Photo 7")).toHaveAttribute("src", "/img/7.jpg");
    expect(image("Photo 7")).toHaveAttribute("fetchpriority", "low");
  });

  it("releases the neighbors when the current image fails", async () => {
    await openAt(5, { preload: 1 });
    fireEvent.error(image("Photo 6"));
    expect(image("Photo 7")).toHaveAttribute("src", "/img/7.jpg");
  });

  it("keeps a loaded image's source after the user moves on", async () => {
    const { user } = await openAt(5, { preload: 1 });
    fireEvent.load(image("Photo 6"));
    await user.keyboard("{ArrowRight}");
    expect(image("Photo 7")).toHaveAttribute("fetchpriority", "high");
    expect(image("Photo 6")).toHaveAttribute("src", "/img/6.jpg");
    expect(image("Photo 8")).not.toHaveAttribute("src");
  });

  it("shows the thumbnail behind the image until the image loads", async () => {
    await openAt(5, { preload: 1 });
    expect(image("Photo 6").style.backgroundImage).toBe('url("/img/6-thumb.jpg")');
    fireEvent.load(image("Photo 6"));
    expect(image("Photo 6").style.backgroundImage).toBe("");
  });

  it("loads the thumbnail strip at low priority", async () => {
    const { dialog } = await openAt(0);
    const strip = dialog.querySelectorAll(".eg-thumbnail-image");
    expect(strip.length).toBeGreaterThan(0);
    for (const thumb of strip) expect(thumb).toHaveAttribute("fetchpriority", "low");
  });

  describe("picture sources", () => {
    const withSources = slides.map((slide, i) => ({
      ...slide,
      sources: [
        { srcSet: `/img/${i + 1}.avif`, type: "image/avif" },
        { srcSet: `/img/${i + 1}-tall.webp 800w`, media: "(orientation: portrait)", sizes: "50vw" },
      ],
    }));

    it("wraps the image in a picture with its sources first", async () => {
      await openAt(5, { preload: 1, slides: withSources });
      const picture = image("Photo 6").parentElement;
      expect(picture?.tagName).toBe("PICTURE");
      const sources = picture?.querySelectorAll("source") ?? [];
      expect(sources).toHaveLength(2);
      expect(sources[0]).toHaveAttribute("srcset", "/img/6.avif");
      expect(sources[0]).toHaveAttribute("type", "image/avif");
      expect(sources[1]).toHaveAttribute("media", "(orientation: portrait)");
      expect(sources[1]).toHaveAttribute("sizes", "50vw");
      expect(picture?.lastElementChild).toBe(image("Photo 6"));
    });

    it("gives sources without sizes the same sizes as the image", async () => {
      await openAt(5, { preload: 1, slides: withSources });
      const first = image("Photo 6").parentElement?.querySelector("source");
      expect(first?.getAttribute("sizes")).toBe(image("Photo 6").getAttribute("sizes"));
    });

    it("holds the neighbors' sources until the current image settles", async () => {
      await openAt(5, { preload: 1, slides: withSources });
      const sourcesOf = (alt: string) => image(alt).parentElement?.querySelectorAll("source") ?? [];
      for (const source of sourcesOf("Photo 7")) expect(source).not.toHaveAttribute("srcset");
      fireEvent.load(image("Photo 6"));
      expect(sourcesOf("Photo 7")[0]).toHaveAttribute("srcset", "/img/7.avif");
    });

    it("renders a bare image when the slide has no sources", async () => {
      await openAt(5, { preload: 1 });
      expect(image("Photo 6").parentElement?.tagName).not.toBe("PICTURE");
    });
  });
});
