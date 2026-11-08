import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile, copyFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { build } from "vite";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));
const componentSourceDirectory = join(repositoryRoot, "packages/interactive/src/components/envelope-reveal");
const isolatedApplication = await mkdtemp(join(repositoryRoot, "tests/consumers/source-vite/.consumer-"));
const copiedFiles = ["EnvelopeReveal.tsx", "index.ts", "envelope-reveal.css"];

try {
  const componentDirectory = join(isolatedApplication, "src/components/envelope-reveal");
  await mkdir(componentDirectory, { recursive: true });
  await Promise.all(copiedFiles.map((name) => copyFile(
    join(componentSourceDirectory, name),
    join(componentDirectory, name),
  )));
  await copyFile(join(repositoryRoot, "LICENSE"), join(isolatedApplication, "LICENSE"));
  await writeFile(join(isolatedApplication, "package.json"), JSON.stringify({
    name: "frilcraft-source-consumer-validation",
    private: true,
    type: "module",
    dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
  }, null, 2));
  await writeFile(join(isolatedApplication, "index.html"), `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Source consumer</title></head>
<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`);
  await mkdir(join(isolatedApplication, "src"), { recursive: true });
  await writeFile(join(isolatedApplication, "src/main.tsx"), `import { createRoot } from "react-dom/client";
import { EnvelopeReveal } from "./components/envelope-reveal/index";
import "./components/envelope-reveal/envelope-reveal.css";

const root = document.getElementById("root");
if (!root) throw new Error("Consumer root was not found.");
createRoot(root).render(<EnvelopeReveal title="Source consumer validation" />);
`);

  await build({
    configFile: false,
    root: isolatedApplication,
    plugins: [react()],
    resolve: { dedupe: ["react", "react-dom"] },
    build: { outDir: "dist", emptyOutDir: true },
    logLevel: "warn",
  });

  const assetsDirectory = join(isolatedApplication, "dist/assets");
  const assets = await readdir(assetsDirectory);
  const javascriptFiles = assets.filter((name) => name.endsWith(".js"));
  const cssFiles = assets.filter((name) => name.endsWith(".css"));
  assert.ok(javascriptFiles.length > 0, "Source consumer should emit a JavaScript bundle.");
  assert.ok(cssFiles.length > 0, "Source consumer should emit a CSS bundle.");

  const javascript = (await Promise.all(javascriptFiles.map((name) => readFile(join(assetsDirectory, name), "utf8")))).join("\n");
  const css = (await Promise.all(cssFiles.map((name) => readFile(join(assetsDirectory, name), "utf8")))).join("\n");
  assert.match(javascript, /Source consumer validation/, "Copied component should be included in the app bundle.");
  assert.match(javascript, /fc-envelope__trigger/, "Copied component markup should be included in the app bundle.");
  assert.doesNotMatch(javascript, /@frillab\/interactive/, "Source consumer must not import the workspace package.");
  assert.doesNotMatch(javascript, /(?:from\s*|import\s*\()\s*["']three(?:\.js)?["']/i, "DOM component bundle must not import Three.js.");
  assert.match(css, /\.fc-envelope__trigger/, "Copied component stylesheet should be included in the app bundle.");
  console.log("Source consumer build passed: real component files and CSS bundle without the workspace package or Three.js.");
} finally {
  await rm(isolatedApplication, { recursive: true, force: true });
}
