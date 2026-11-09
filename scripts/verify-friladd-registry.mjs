// Verify that the FrilAdd manifest matches the actual component source files.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(join(root, "registry.json"), "utf8"));
if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.items)) {
  throw new Error("Invalid FrilAdd registry schema");
}

const componentIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const registryIds = manifest.items.map(item => item.name);
const seenRegistryIds = new Set();
for (const id of registryIds) {
  if (typeof id !== "string" || !componentIdPattern.test(id)) {
    throw new Error(`Unsafe FrilAdd item name: ${id}`);
  }
  const normalized = id.toLowerCase();
  if (seenRegistryIds.has(normalized)) {
    throw new Error(`Duplicate FrilAdd item name: ${id}`);
  }
  seenRegistryIds.add(normalized);
}

const catalogPath = join(root, "apps/playground/src/catalog.tsx");
const catalogText = await readFile(catalogPath, "utf8");
const catalogFile = ts.createSourceFile(catalogPath, catalogText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const installableCatalogIds = [];
const property = (object, name) => object.properties.find(entry =>
  ts.isPropertyAssignment(entry) && ts.isIdentifier(entry.name) && entry.name.text === name);

function collectInstallableCatalogIds(node) {
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "registerComponent") {
    const definition = node.arguments[0];
    if (!definition || !ts.isObjectLiteralExpression(definition)) {
      throw new Error("Playground registrations must pass an explicit metadata object to registerComponent");
    }
    const installable = property(definition, "installable")?.initializer;
    if (installable && installable.kind !== ts.SyntaxKind.TrueKeyword && installable.kind !== ts.SyntaxKind.FalseKeyword) {
      throw new Error("Playground installable metadata must be a boolean literal");
    }
    if (installable?.kind === ts.SyntaxKind.TrueKeyword) {
      const id = property(definition, "id")?.initializer;
      if (!id || !ts.isStringLiteral(id) || !componentIdPattern.test(id.text)) {
        throw new Error("Installable Playground components need a safe, literal component ID");
      }
      installableCatalogIds.push(id.text);
    }
  }
  ts.forEachChild(node, collectInstallableCatalogIds);
}
collectInstallableCatalogIds(catalogFile);

if (new Set(installableCatalogIds).size !== installableCatalogIds.length) {
  throw new Error("Duplicate installable component ID in the Playground catalog");
}
const sortedRegistryIds = [...registryIds].sort();
const sortedCatalogIds = [...installableCatalogIds].sort();
if (JSON.stringify(sortedRegistryIds) !== JSON.stringify(sortedCatalogIds)) {
  throw new Error(`Installable Playground IDs (${sortedCatalogIds.join(", ")}) do not match Registry items (${sortedRegistryIds.join(", ")})`);
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
console.log(`FrilAdd registry verified: ${manifest.items.length} item(s), ${count} file(s); installable Playground IDs match the Registry.`);
