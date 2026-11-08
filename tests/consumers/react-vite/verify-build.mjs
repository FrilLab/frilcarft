import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const packageOutput = new URL("../../../packages/interactive/dist/", import.meta.url);
const outputDirectory = new URL("./dist/assets/", import.meta.url);
const files = await readdir(fileURLToPath(outputDirectory));
const javascriptFiles = files.filter((file) => file.endsWith(".js"));
const cssFiles = files.filter((file) => file.endsWith(".css"));

assert.ok(javascriptFiles.length > 0, "Consumer JS bundle should be emitted.");
assert.ok(cssFiles.length > 0, "Consumer stylesheet should be emitted.");

const javascript = (await Promise.all(
  javascriptFiles.map((file) => readFile(new URL(file, outputDirectory), "utf8")),
)).join("\n");
const css = (await Promise.all(
  cssFiles.map((file) => readFile(new URL(file, outputDirectory), "utf8")),
)).join("\n");

assert.doesNotMatch(javascript, /(?:from\s*|import\s*\()\s*["']three(?:\.js)?["']/i, "DOM component bundle must not import Three.js.");
assert.match(css, /\.fc-envelope__trigger/, "Consumer stylesheet should contain Envelope Reveal styles.");

const libraryJavaScript = await readFile(new URL("envelope-reveal.js", packageOutput), "utf8");
const declarationFile = new URL("types/components/envelope-reveal/index.d.ts", packageOutput);
const libraryCss = new URL("envelope-reveal.css", packageOutput);
assert.match(libraryJavaScript, /from\s+["']react["']/, "Library output should use the React peer dependency.");
assert.match(libraryJavaScript, /from\s+["']react\/jsx-runtime["']/, "JSX runtime should remain external to the library bundle.");
assert.doesNotMatch(libraryJavaScript, /(?:from\s*|import\s*\()\s*["']three(?:\.js)?["']/i, "DOM library output must not import Three.js.");
await readFile(fileURLToPath(declarationFile), "utf8");
await readFile(fileURLToPath(libraryCss), "utf8");
