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

assert.doesNotMatch(javascript, /(?:from\s*|import\s*\()\s*["'](?:three(?:\.js)?|@react-three\/(?:fiber|drei))["']/i, "DOM component bundle must not import a 3D runtime.");
assert.match(css, /perspective:\s*850px/, "Consumer Tailwind stylesheet should contain the component's perspective utility.");
assert.match(css, /clip-path:\s*polygon/, "Consumer Tailwind stylesheet should contain the envelope geometry utilities.");
assert.match(css, /prefers-reduced-motion/, "Consumer Tailwind stylesheet should preserve reduced-motion styling.");

const libraryJavaScript = await readFile(new URL("envelope-reveal.js", packageOutput), "utf8");
const declarationFile = new URL("types/components/envelope-reveal/EnvelopeReveal.d.ts", packageOutput);
assert.match(libraryJavaScript, /from\s+["']react["']/, "Library output should use the React peer dependency.");
assert.match(libraryJavaScript, /from\s+["']react\/jsx-runtime["']/, "JSX runtime should remain external to the library bundle.");
assert.match(libraryJavaScript, /from\s+["']cn["']/, "Library output should use its declared cn runtime dependency.");
assert.doesNotMatch(libraryJavaScript, /(?:from\s*|import\s*\()\s*["'](?:three(?:\.js)?|@react-three\/(?:fiber|drei))["']/i, "DOM library output must not import a 3D runtime.");
const declarations = await readFile(fileURLToPath(declarationFile), "utf8");
const declarationBarrel = await readFile(new URL("types/components/envelope-reveal/index.d.ts", packageOutput), "utf8");
assert.match(declarationBarrel, /EnvelopeRevealProps/, "Package export barrel must expose the component props type.");
for (const property of ["title", "message", "eyebrow", "envelopeColor", "accentColor", "paperColor", "initiallyOpen", "onOpenChange", "className", "style"]) {
  assert.match(declarations, new RegExp(`\\b${property}\\??:`), `Declaration must preserve the ${property} prop.`);
}
assert.ok(!(await readdir(fileURLToPath(packageOutput))).includes("envelope-reveal.css"), "The CSS-free component package must not emit or copy a stylesheet.");
