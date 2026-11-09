import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: fileURLToPath(new URL("./", import.meta.url)),
  plugins: [tailwindcss(), react()],
  resolve: { dedupe: ["react", "react-dom"] },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
