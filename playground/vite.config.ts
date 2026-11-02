import react from "@vitejs/plugin-react";
import { defineConfig, type UserConfig } from "vite";

const config: UserConfig = defineConfig({
  plugins: [react()],
});

export default config;
