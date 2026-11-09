// Verify that the FrilAdd manifest matches the actual component source files.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(join(root, "registry.json"), "utf8"));
if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.items)) {
  throw new Error("Invalid FrilAdd registry schema");
}

let count = 0;
for (const item of manifest.items) {
  if (!Array.isArray(item.files) || item.files.length === 0) {
    throw new Error(`Missing registry files: ${item.name}`);
  }
  const targets = new Set();
  for (const file of item.files) {
    for (const value of [file.source, file.target]) {
      if (typeof value !== "string" ||
          !/^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/.test(value) ||
          value.split("/").some(part => part === "." || part === "..")) {
        throw new Error(`Unsafe registry path: ${value}`);
      }
    }
    if (targets.has(file.target.toLowerCase())) {
      throw new Error(`Duplicate target: ${file.target}`);
    }
    targets.add(file.target.toLowerCase());
    const path = resolve(root, file.source);
    if (!path.startsWith(root + sep)) {
      throw new Error(`Source escapes repository: ${file.source}`);
    }
    const content = await readFile(path);
    const hash = createHash("sha256").update(content).digest("hex");
    if (hash !== file.sha256) {
      throw new Error(`Registry SHA-256 mismatch for ${file.source}: expected ${file.sha256}, got ${hash}`);
    }
    count += 1;
  }
}
console.log(`FrilAdd registry verified: ${manifest.items.length} item(s), ${count} file(s).`);
