import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/components/envelope-reveal/index.ts",
      formats: ["es"],
      fileName: "envelope-reveal",
      cssFileName: "envelope-reveal",
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
