import { defineConfig, type UserConfig } from "tsdown";

const config: UserConfig = defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  platform: "browser",
  target: "es2022",
  dts: true,
  sourcemap: false,
  minify: false,
  banner: { js: '"use client";' },
  copy: [{ from: "src/styles.css", to: "dist" }],
  publint: true,
});

export default config;
