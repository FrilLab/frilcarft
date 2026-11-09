import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { sourceFilePlugin } from "./source-file-plugin.js";

export default defineConfig({
  plugins: [tailwindcss(), sourceFilePlugin(), react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    manifest: true,
  },
  optimizeDeps: {
    exclude: ["@frillab/interactive"],
  },
  server: {
    port: 5173,
  },
});
