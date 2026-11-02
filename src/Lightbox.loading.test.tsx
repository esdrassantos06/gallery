import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { openAt } from "./test/harness";

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
});
