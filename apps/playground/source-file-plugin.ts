import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Plugin } from "vite";

const virtualPrefix = "\0frilcraft-source-file:";

/** Expose a current local source file as a string during dev and production builds. */
export function sourceFilePlugin(): Plugin {
  return {
    name: "frilcraft-source-file-text",
    enforce: "pre",
    resolveId(source, importer) {
      const queryStart = source.indexOf("?");
      if (queryStart === -1 || !source.slice(queryStart + 1).split("&").includes("sourceText")) {
        return null;
      }

      const requestedPath = source.slice(0, queryStart);
      const filePath = resolve(importer ? dirname(importer) : process.cwd(), requestedPath);
      return `${virtualPrefix}${filePath}.js`;
    },
    load(id) {
      if (!id.startsWith(virtualPrefix)) {
        return null;
      }

      const filePath = id.slice(virtualPrefix.length, -3);
      this.addWatchFile(filePath);
      return `export default ${JSON.stringify(readFileSync(filePath, "utf8"))};`;
    },
  };
}
