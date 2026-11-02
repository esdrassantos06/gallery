# Logo

The mark shows the lightbox's signature move: a small thumbnail flying out into a full frame.

| File             | Use                                                                         |
| ---------------- | --------------------------------------------------------------------------- |
| `logo-light.svg` | Horizontal lockup for light backgrounds                                     |
| `logo-dark.svg`  | Horizontal lockup for dark backgrounds                                      |
| `icon.svg`       | App icon, favicon, avatars (black tile, works on light and mid backgrounds) |
| `icon-mono.svg`  | Single colour in `currentColor`, for inline SVG next to text                |

- Keep clear space of at least a quarter of the icon height around the mark.
- Smallest size: 16px for `icon.svg`, 120px wide for the lockups.
- Do not stretch, recolour outside the files above, add effects or rotate it.
- The wordmark uses the system UI font stack, so it renders in each platform's sans serif. Convert the text to outlines in a vector editor if you need it pixel-identical everywhere.
- To export PNG: `magick -background none -density 384 assets/logo/icon.svg icon.png` (shapes only; text needs a renderer with font support).
