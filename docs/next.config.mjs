import { fileURLToPath } from "node:url";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX({ macro: false });

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  reactStrictMode: true,
  turbopack: { root: fileURLToPath(new URL("..", import.meta.url)) },
};

export default withMDX(config);
