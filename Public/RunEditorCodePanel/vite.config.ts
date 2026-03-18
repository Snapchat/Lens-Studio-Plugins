import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  root: "ui",
  build: {
    outDir: "../dist/ui",
    emptyOutDir: true,
  },
});
