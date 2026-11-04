import { fileURLToPath } from "node:url";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX({ macro: false });

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  turbopack: { root: fileURLToPath(new URL("..", import.meta.url)) },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
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
