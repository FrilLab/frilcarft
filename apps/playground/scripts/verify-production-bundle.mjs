import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(appRoot, "dist");
const manifest = JSON.parse(await readFile(join(dist, ".vite/manifest.json"), "utf8"));
const entries = Object.entries(manifest);
const htmlEntry = manifest["index.html"];
assert.ok(htmlEntry, "Vite production manifest must include the HTML entry");

function collectStaticFiles(entry, seen = new Set()) {
  if (!entry || seen.has(entry.file)) return seen;
  seen.add(entry.file);
  for (const imported of entry.imports ?? []) collectStaticFiles(manifest[imported], seen);
  for (const stylesheet of entry.css ?? []) seen.add(stylesheet);
  return seen;
}

const initialFiles = collectStaticFiles(htmlEntry);
const html = await readFile(join(dist, "index.html"), "utf8");
const initialScripts = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => match[1].replace(/^\//, ""));
assert.ok(initialScripts.length > 0, "Production HTML must reference the initial JavaScript entry");
for (const script of initialScripts) initialFiles.add(script);

const initialJavaScript = await Promise.all(
  [...initialFiles].filter((file) => file.endsWith(".js")).map((file) => readFile(join(dist, file), "utf8")),
);
const initialCode = initialJavaScript.join("\n");
assert.ok(!initialCode.includes("export interface EnvelopeRevealProps"), "Raw component source text leaked into the initial Gallery bundle");
assert.ok(!initialCode.includes("--fc-envelope-color"), "Envelope Reveal implementation leaked into the initial Gallery bundle");
assert.ok(!/(?:from|import\()\s*["'](?:three(?:\/|["'])|@react-three\/(?:fiber|drei))/i.test(initialCode), "3D runtime dependencies leaked into the initial Gallery bundle");

const reusableBundle = await readFile(join(appRoot, "../../packages/interactive/dist/envelope-reveal.js"), "utf8");
assert.ok(!/(?:from|import\()\s*["'](?:radix-ui|@radix-ui\/)/i.test(reusableBundle), "Playground Radix dependencies leaked into the reusable component bundle");
assert.ok(!reusableBundle.includes("components/ui/"), "Playground shadcn/ui source leaked into the reusable component bundle");

const initialStylesheets = await Promise.all(
  [...initialFiles].filter((file) => file.endsWith(".css")).map((file) => readFile(join(dist, file), "utf8")),
);
const initialCss = initialStylesheets.join("\n");
assert.match(initialCss, /perspective:\s*850px/, "Tailwind must scan the reusable component source and emit its perspective utility.");
assert.match(initialCss, /clip-path:\s*polygon/, "Tailwind must emit the envelope geometry utilities.");
assert.match(initialCss, /prefers-reduced-motion/, "Tailwind must emit reduced-motion utilities.");
assert.match(initialCss, /\[data-state=open\]/, "Tailwind must emit the open-state envelope transforms.");
assert.match(initialCss, /rotateX\(180deg\).*translateY\(-40%\)/, "Tailwind must preserve flap and letter movement transitions.");

const dynamicDetails = entries.filter(([key, value]) => key.includes("/catalog/entries/") && value.isDynamicEntry);
assert.ok(dynamicDetails.length > 0, "Component detail entries must be emitted dynamically");
assert.equal(new Set(dynamicDetails.map(([, value]) => value.file)).size, dynamicDetails.length, "Each component detail entry must have its own JavaScript chunk");
const detailEntry = dynamicDetails.find(([key]) => key.endsWith("/catalog/entries/envelope-reveal.tsx"));
assert.ok(detailEntry, "Envelope Reveal must be emitted as a dynamic detail entry");
const detailCode = await readFile(join(dist, detailEntry[1].file), "utf8");
assert.ok(detailCode.includes("--fc-envelope-color"), "The lazy detail chunk must include the actual component implementation");
assert.ok(detailCode.includes("export interface EnvelopeRevealProps"), "The lazy detail chunk must include source text for the source-files panel");
assert.ok(!html.includes("envelope-reveal"), "Component-specific assets must not be linked by the initial HTML");

console.log(`Playground bundle boundaries verified: ${initialScripts.length} initial script(s), Tailwind styles in the shared stylesheet, detail code and raw source in ${detailEntry[1].file}.`);
