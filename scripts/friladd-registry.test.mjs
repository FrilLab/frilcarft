import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { syncRegistry, verifyRegistry } from "./friladd-registry.mjs";

let root;
let sourcePath;
let manifest;

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function saveManifest() {
  await writeFile(join(root, "registry.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "frilcraft-registry-test-"));
  sourcePath = "packages/interactive/src/components/sample.tsx";
  await mkdir(join(root, "packages/interactive/src/components"), { recursive: true });
  await mkdir(join(root, "apps/playground/src/catalog"), { recursive: true });
  await writeFile(join(root, sourcePath), "export const value = 'before';\n");
  await writeFile(join(root, "apps/playground/src/catalog/index.ts"), `export const componentCatalog = [
  { id: "sample", installable: true },
];\n`);
  manifest = {
    schemaVersion: 1,
    name: "frilcraft",
    items: [{
      name: "sample",
      description: "Sample component",
      files: [{ source: sourcePath, target: "src/components/sample.tsx", sha256: hash("export const value = 'before';\n") }],
    }],
  };
  await saveManifest();
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("FrilAdd Registry maintenance", () => {
  it("fails on changed source bytes, synchronizes deterministically, then verifies read-only", async () => {
    await verifyRegistry(root);
    await writeFile(join(root, sourcePath), "export const value = 'after';\n");
    await expect(verifyRegistry(root)).rejects.toThrow("Registry SHA-256 mismatch");

    const updated = await syncRegistry(root);
    expect(updated).toEqual([`sample: ${sourcePath} (${hash("export const value = 'before';\n")} -> ${hash("export const value = 'after';\n")})`]);
    const synchronized = await readFile(join(root, "registry.json"), "utf8");
    expect(JSON.parse(synchronized).items[0].files[0].sha256).toBe(hash("export const value = 'after';\n"));
    await verifyRegistry(root);

    expect(await syncRegistry(root)).toEqual([]);
    expect(await readFile(join(root, "registry.json"), "utf8")).toBe(synchronized);
  });

  it("rejects unsafe and missing source paths", async () => {
    manifest.items[0].files[0].source = "../outside.tsx";
    await saveManifest();
    await expect(syncRegistry(root)).rejects.toThrow("Unsafe registry source path");

    manifest.items[0].files[0].source = "packages/interactive/src/components/missing.tsx";
    await saveManifest();
    await expect(verifyRegistry(root)).rejects.toThrow("Missing registry source file");
  });

  it("repairs a malformed hash value and rejects it during read-only verification", async () => {
    manifest.items[0].files[0].sha256 = "not-a-digest";
    await saveManifest();
    await expect(verifyRegistry(root)).rejects.toThrow("Invalid SHA-256 value");

    const expected = hash("export const value = 'before';\n");
    expect(await syncRegistry(root)).toEqual([`sample: ${sourcePath} (not-a-digest -> ${expected})`]);
    await verifyRegistry(root);
  });

  it("rejects duplicate item IDs, target paths, and catalog ID mismatches", async () => {
    manifest.items.push({ ...manifest.items[0] });
    await saveManifest();
    await expect(verifyRegistry(root)).rejects.toThrow("Duplicate FrilAdd item name");

    manifest.items.pop();
    manifest.items[0].files.push({ ...manifest.items[0].files[0], source: sourcePath });
    await saveManifest();
    await expect(verifyRegistry(root)).rejects.toThrow("Duplicate target path");

    manifest.items[0].files.pop();
    await saveManifest();
    await writeFile(join(root, "apps/playground/src/catalog/index.ts"), `export const componentCatalog = [
  { id: "other", installable: true },
];\n`);
    await expect(verifyRegistry(root)).rejects.toThrow("do not match Registry items");
  });
});
