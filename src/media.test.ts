import { describe, expect, it } from "vitest";
import { getMedia } from "./media";

describe("getMedia", () => {
  it("treats plain URLs as images", () => {
    expect(getMedia({ src: "/a.jpg" })).toEqual({ kind: "image" });
    expect(getMedia({ src: "/a.jpg?w=200" })).toEqual({ kind: "image" });
  });

  it("detects video files by extension, ignoring query strings and case", () => {
    expect(getMedia({ src: "/clip.mp4" })).toEqual({ kind: "video" });
    expect(getMedia({ src: "/clip.WEBM?v=2" })).toEqual({ kind: "video" });
    expect(getMedia({ src: "/clip.mov" })).toEqual({ kind: "video" });
  });

  it("honours an explicit type over detection", () => {
    expect(getMedia({ src: "/stream", type: "video" })).toEqual({ kind: "video" });
    expect(getMedia({ src: "/clip.mp4", type: "image" })).toEqual({ kind: "image" });
    expect(getMedia({ src: "https://example.com/map", type: "iframe" })).toEqual({
      kind: "iframe",
      embed: "https://example.com/map",
    });
  });

  it("embeds YouTube links through youtube-nocookie.com", () => {
    const urls = [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      "https://youtube.com/shorts/dQw4w9WgXcQ",
    ];
    for (const src of urls) {
      const media = getMedia({ src });
      expect(media.kind).toBe("youtube");
      expect(media.embed).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?/);
    }
  });

  it("keeps the YouTube start time and adds autoplay only when asked", () => {
    const plain = new URL(getMedia({ src: "https://youtu.be/abc_DEF-123?t=42" }).embed!);
    expect(plain.searchParams.get("start")).toBe("42");
    expect(plain.searchParams.get("playsinline")).toBe("1");
    expect(plain.searchParams.has("autoplay")).toBe(false);
    const auto = new URL(
      getMedia({ src: "https://youtu.be/abc_DEF-123" }, { autoplay: true }).embed!,
    );
    expect(auto.searchParams.get("autoplay")).toBe("1");
    expect(auto.searchParams.get("mute")).toBe("1");
  });

  it("embeds Vimeo links with Do Not Track, including private hashes", () => {
    const media = getMedia({ src: "https://vimeo.com/76979871" });
    expect(media.kind).toBe("vimeo");
    const url = new URL(media.embed!);
    expect(url.origin + url.pathname).toBe("https://player.vimeo.com/video/76979871");
    expect(url.searchParams.get("dnt")).toBe("1");
    const privateUrl = new URL(getMedia({ src: "https://vimeo.com/76979871/a1b2c3d4e5" }).embed!);
    expect(privateUrl.searchParams.get("h")).toBe("a1b2c3d4e5");
    const auto = new URL(
      getMedia({ src: "https://player.vimeo.com/video/76979871" }, { autoplay: true }).embed!,
    );
    expect(auto.searchParams.get("autoplay")).toBe("1");
    expect(auto.searchParams.get("muted")).toBe("1");
  });

  it("does not mistake look-alike hosts for providers", () => {
    expect(getMedia({ src: "https://notyoutube.com/watch?v=abc" }).kind).toBe("image");
    expect(getMedia({ src: "https://example.com/vimeo.com/123" }).kind).toBe("image");
  });

  it("derives a YouTube poster when the slide has none", () => {
    expect(getMedia({ src: "https://youtu.be/abc" }).poster).toBe(
      "https://i.ytimg.com/vi/abc/hqdefault.jpg",
    );
    expect(getMedia({ src: "https://youtu.be/abc", poster: "/p.jpg" }).poster).toBeUndefined();
  });
});
