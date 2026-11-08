import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

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
