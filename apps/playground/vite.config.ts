import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sourceFilePlugin } from "./source-file-plugin.js";

export default defineConfig({
  plugins: [sourceFilePlugin(), react()],
  optimizeDeps: {
    exclude: ["@frillab/interactive"],
  },
  server: {
    port: 5173,
  },
});
