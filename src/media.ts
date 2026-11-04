import type { Slide } from "./types";

/** What a slide renders as. */
export type MediaKind = "image" | "video" | "youtube" | "vimeo" | "iframe";

/** Result of {@link getMedia}. */
export interface Media {
  kind: MediaKind;
  /** Iframe URL for `youtube`, `vimeo` and `iframe` slides. */
  embed?: string;
  /** Poster derived from the provider when the slide has none (YouTube only). */
  poster?: string;
}

/** Options that change the embed URLs. */
export interface MediaOptions {
  /** Ask the player to start on its own. Browsers only allow it muted. */
  autoplay?: boolean | undefined;
}

const VIDEO_EXTENSION = /\.(mp4|webm|ogv|ogg|mov|m4v)$/i;

function parse(src: string): URL | null {
  try {
    return new URL(src, "https://relative.invalid");
  } catch {
    return null;
  }
}

const WEB_SCHEMES = ["http:", "https:", "blob:"];

/**
 * Whether `src` parses to a scheme outside the web schemes plus `extra`, such
 * as `javascript:` or `data:`. Relative and malformed URLs return `false`.
 */
export function hasUnsafeScheme(src: string, extra: readonly string[] = []): boolean {
  const url = parse(src);
  return !!url && !WEB_SCHEMES.includes(url.protocol) && !extra.includes(url.protocol);
}

function hostIs(url: URL, ...hosts: string[]): boolean {
  const host = url.hostname.replace(/^(www|m)\./, "");
  return hosts.includes(host);
}

function youtubeId(url: URL): string | null {
  if (hostIs(url, "youtu.be")) return url.pathname.split("/")[1] || null;
  if (!hostIs(url, "youtube.com", "youtube-nocookie.com")) return null;
  if (url.pathname === "/watch") return url.searchParams.get("v");
  const [, kind, id] = url.pathname.split("/");
  return (kind === "embed" || kind === "shorts" || kind === "live") && id ? id : null;
}

function startSeconds(value: string | null): string | null {
  if (!value) return null;
  if (/^\d+$/.test(value)) return value;
  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(value);
  if (!match || !match[0]) return null;
  const [, h = "0", m = "0", s = "0"] = match;
  return String(Number(h) * 3600 + Number(m) * 60 + Number(s));
}

function vimeoPath(url: URL): { id: string; hash: string | null } | null {
  if (!hostIs(url, "vimeo.com", "player.vimeo.com")) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const start = parts[0] === "video" ? 1 : 0;
  const id = parts[start];
  if (!id || !/^\d+$/.test(id)) return null;
  return { id, hash: url.searchParams.get("h") ?? parts[start + 1] ?? null };
}

/**
 * Decides how a slide renders. An explicit `type` wins; otherwise YouTube and
 * Vimeo links become privacy-friendly embeds, video file extensions become a
 * native `<video>`, and anything else is an image.
 */
export function getMedia(
  slide: Pick<Slide, "src" | "type" | "poster">,
  options: MediaOptions = {},
): Media {
  if (slide.type === "image") return { kind: "image" };
  if (slide.type === "video") return { kind: "video" };
  if (slide.type === "iframe") {
    return hasUnsafeScheme(slide.src) ? { kind: "iframe" } : { kind: "iframe", embed: slide.src };
  }
  const url = parse(slide.src);
  if (!url) return { kind: "image" };

  const youtube = youtubeId(url);
  if (youtube) {
    const params = new URLSearchParams({ rel: "0", playsinline: "1" });
    const start = startSeconds(url.searchParams.get("t") ?? url.searchParams.get("start"));
    if (start) params.set("start", start);
    if (options.autoplay) {
      params.set("autoplay", "1");
      params.set("mute", "1");
    }
    return {
      kind: "youtube",
      embed: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtube)}?${params}`,
      ...(slide.poster
        ? {}
        : { poster: `https://i.ytimg.com/vi/${encodeURIComponent(youtube)}/hqdefault.jpg` }),
    };
  }

  const vimeo = vimeoPath(url);
  if (vimeo) {
    const params = new URLSearchParams();
    if (vimeo.hash) params.set("h", vimeo.hash);
    params.set("dnt", "1");
    if (options.autoplay) {
      params.set("autoplay", "1");
      params.set("muted", "1");
    }
    return { kind: "vimeo", embed: `https://player.vimeo.com/video/${vimeo.id}?${params}` };
  }

  return VIDEO_EXTENSION.test(url.pathname) ? { kind: "video" } : { kind: "image" };
}

/**
 * Small still for a slide in grids and the thumbnail strip: its `thumbnail`,
 * then its `poster`, then the provider's poster, then the image itself. Videos
 * and iframes without any still get `undefined`, never their own file.
 */
export function previewOf(
  slide: Pick<Slide, "src" | "type" | "poster" | "thumbnail">,
): string | undefined {
  if (slide.thumbnail ?? slide.poster) return slide.thumbnail ?? slide.poster;
  const media = getMedia(slide);
  return media.poster ?? (media.kind === "image" ? slide.src : undefined);
}
