# Logo

The mark shows the lightbox's signature move: a small thumbnail lifting into a full frame, with one ghost frame for the path between.

| File             | Use                                                                         |
| ---------------- | --------------------------------------------------------------------------- |
| `logo-light.svg` | Horizontal lockup for light backgrounds                                     |
| `logo-dark.svg`  | Horizontal lockup for dark backgrounds                                      |
| `icon.svg`       | App icon, favicon, avatars (black tile, works on light and mid backgrounds) |
| `icon-mono.svg`  | Single colour in `currentColor`, for inline SVG next to text                |

- Keep clear space of at least a quarter of the icon height around the mark.
- Smallest size: 16px for `icon.svg`, 120px wide for the lockups.
- Do not stretch, recolour outside the files above, add effects or rotate it.
- The wordmark is Geist SemiBold converted to outlines, so it looks the same everywhere without loading a font.
- To export PNG: `magick -background none -density 384 assets/logo/icon.svg icon.png` .
