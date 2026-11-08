import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { sourceFilePlugin } from "./apps/playground/source-file-plugin.js";

export default defineConfig({
  plugins: [sourceFilePlugin(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: [
      "packages/interactive/src/**/*.test.ts",
      "packages/interactive/src/**/*.test.tsx",
      "apps/playground/src/**/*.test.ts",
      "apps/playground/src/**/*.test.tsx",
    ],
  },
});
