import { fileURLToPath } from "node:url";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX({ macro: false });

const google = process.env.NEXT_PUBLIC_GTM_ID
  ? {
      script: " https://www.googletagmanager.com",
      connect:
        " https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
      img: " https://*.google-analytics.com https://*.googletagmanager.com https://fonts.gstatic.com",
      style: " https://www.googletagmanager.com https://fonts.googleapis.com",
      font: " https://fonts.gstatic.com",
    }
  : { script: "", connect: "", img: "", style: "", font: "" };

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}${google.script}`,
  `style-src 'self' 'unsafe-inline'${google.style}`,
  `img-src 'self' blob: data:${google.img}`,
  "media-src 'self'",
  `font-src 'self'${google.font}`,
  "frame-src 'self'",
  `connect-src 'self'${google.connect}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  turbopack: { root: fileURLToPath(new URL("..", import.meta.url)) },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/:dir(samples|videos)/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default withMDX(config);
