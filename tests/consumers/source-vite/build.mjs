import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile, copyFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import ts from "typescript-api";
import { build } from "vite";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));
const componentSourceDirectory = join(repositoryRoot, "packages/interactive/src/components/envelope-reveal");
const isolatedApplication = await mkdtemp(join(repositoryRoot, "tests/consumers/source-vite/.consumer-"));
const copiedFiles = ["EnvelopeReveal.tsx", "index.ts"];

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
    dependencies: { react: "^19.0.0", "react-dom": "^19.0.0", cn: "^0.5.2" },
    devDependencies: { tailwindcss: "^4.3.5", "@tailwindcss/vite": "^4.3.5" },
  }, null, 2));
  await writeFile(join(isolatedApplication, "tsconfig.json"), JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      strict: true,
      skipLibCheck: true,
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      types: ["vite/client"],
      noEmit: true,
    },
    include: ["src/**/*.ts", "src/**/*.tsx"],
  }, null, 2));
  await writeFile(join(isolatedApplication, "index.html"), `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Source consumer</title></head>
<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`);
  await mkdir(join(isolatedApplication, "src"), { recursive: true });
  await writeFile(join(isolatedApplication, "src/main.tsx"), `import { createRoot } from "react-dom/client";
import { EnvelopeReveal } from "./components/envelope-reveal/index";
import "./consumer.css";

const root = document.getElementById("root");
if (!root) throw new Error("Consumer root was not found.");
createRoot(root).render(<EnvelopeReveal title="Source consumer validation" />);
`);
  await writeFile(join(isolatedApplication, "src/consumer.css"), `@import "tailwindcss";

@source "./components/envelope-reveal";
`);

  const tsconfigPath = join(isolatedApplication, "tsconfig.json");
  const tsconfig = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (tsconfig.error) throw new Error(ts.flattenDiagnosticMessageText(tsconfig.error.messageText, "\n"));
  const parsed = ts.parseJsonConfigFileContent(tsconfig.config, ts.sys, isolatedApplication);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
  if (diagnostics.length > 0) {
    throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getCanonicalFileName: (fileName) => fileName,
      getNewLine: () => ts.sys.newLine,
    }));
  }

  await build({
    configFile: false,
    root: isolatedApplication,
    plugins: [tailwindcss(), react()],
    resolve: { dedupe: ["react", "react-dom"] },
    build: { outDir: "dist", emptyOutDir: true },
    logLevel: "warn",
  });

  const assetsDirectory = join(isolatedApplication, "dist/assets");
  const assets = await readdir(assetsDirectory);
  const javascriptFiles = assets.filter((name) => name.endsWith(".js"));
  const cssFiles = assets.filter((name) => name.endsWith(".css"));
  assert.ok(javascriptFiles.length > 0, "Source consumer should emit a JavaScript bundle.");
  assert.ok(cssFiles.length > 0, "Source consumer should emit a Tailwind CSS bundle.");

  const javascript = (await Promise.all(javascriptFiles.map((name) => readFile(join(assetsDirectory, name), "utf8")))).join("\n");
  const css = (await Promise.all(cssFiles.map((name) => readFile(join(assetsDirectory, name), "utf8")))).join("\n");
  assert.match(javascript, /Source consumer validation/, "Copied component should be included in the app bundle.");
  assert.match(javascript, /fc-envelope|envelopeColor/, "Copied component implementation should be included in the app bundle.");
  assert.doesNotMatch(javascript, /@frillab\/interactive/, "Source consumer must not import the workspace package.");
  assert.doesNotMatch(javascript, /(?:from\s*|import\s*\()\s*["'](?:three(?:\.js)?|@react-three\/(?:fiber|drei))["']/i, "DOM component bundle must not import a 3D runtime.");
  assert.match(css, /perspective:\s*850px/, "Copied-source Tailwind CSS should contain the component perspective utility.");
  assert.match(css, /clip-path:\s*polygon/, "Copied-source Tailwind CSS should contain envelope geometry utilities.");
  assert.match(css, /prefers-reduced-motion/, "Copied-source Tailwind CSS should honor reduced-motion utilities.");
  assert.deepEqual(await readdir(componentDirectory), [...copiedFiles].sort(), "The consumer should not require a component stylesheet.");
  console.log("Source consumer passed: copied TSX typechecks and builds with Tailwind styles, React, and cn without the workspace package.");
} finally {
  await rm(isolatedApplication, { recursive: true, force: true });
}
