import react from "@vitejs/plugin-react";
import type { UserConfig } from "vite";
import { defineConfig } from "vitest/config";

const config: UserConfig = defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
});

export default config;
