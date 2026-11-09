import { createHash } from "node:crypto";
import { readFile, realpath, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const componentIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const registryPathPattern = /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/;

function validateRegistryPath(value, label) {
  if (typeof value !== "string" || !registryPathPattern.test(value) ||
      value.split("/").some((part) => part === "." || part === "..") || isAbsolute(value)) {
    throw new Error(`Unsafe registry ${label}: ${value}`);
  }
}

export async function readValidatedManifest(root = defaultRoot) {
  const absoluteRoot = resolve(root);
  const manifestPath = join(absoluteRoot, "registry.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.items)) {
    throw new Error("Invalid FrilAdd Registry Manifest v1 schema");
  }

  const seenIds = new Set();
  const seenTargets = new Set();
  const records = [];
  const realRoot = await realpath(absoluteRoot);
  for (const item of manifest.items) {
    if (!item || typeof item !== "object" || Array.isArray(item) ||
        typeof item.name !== "string" || !componentIdPattern.test(item.name)) {
      throw new Error(`Unsafe FrilAdd item name: ${item?.name}`);
    }
    if (seenIds.has(item.name.toLowerCase())) throw new Error(`Duplicate FrilAdd item name: ${item.name}`);
    seenIds.add(item.name.toLowerCase());
    if (typeof item.description !== "string" || !Array.isArray(item.files) || item.files.length === 0) {
      throw new Error(`Invalid or missing registry files: ${item.name}`);
    }

    for (const file of item.files) {
      if (!file || typeof file !== "object" || Array.isArray(file)) throw new Error(`Invalid registry file entry: ${item.name}`);
      validateRegistryPath(file.source, "source path");
      validateRegistryPath(file.target, "target path");

      const normalizedTarget = file.target.toLowerCase();
      if (seenTargets.has(normalizedTarget)) throw new Error(`Duplicate target path: ${file.target}`);
      seenTargets.add(normalizedTarget);

      const sourcePath = resolve(absoluteRoot, file.source);
      const pathFromRoot = relative(absoluteRoot, sourcePath);
      if (!pathFromRoot || pathFromRoot === ".." || pathFromRoot.startsWith(`..${sep}`) || isAbsolute(pathFromRoot)) {
        throw new Error(`Source escapes repository: ${file.source}`);
      }
      let resolvedSource;
      try {
        resolvedSource = await realpath(sourcePath);
      } catch {
        throw new Error(`Missing registry source file: ${file.source}`);
      }
      const realPathFromRoot = relative(realRoot, resolvedSource);
      if (!realPathFromRoot || realPathFromRoot === ".." || realPathFromRoot.startsWith(`..${sep}`) || isAbsolute(realPathFromRoot)) {
        throw new Error(`Source escapes repository through a symlink: ${file.source}`);
      }
      const content = await readFile(resolvedSource);
      records.push({ item, file, content });
    }
  }

  return { root: absoluteRoot, manifest, records };
}

function findCatalogIds(catalogText, catalogPath) {
  const sourceFile = ts.createSourceFile(catalogPath, catalogText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const declaration = sourceFile.statements.find((statement) =>
    ts.isVariableStatement(statement) && statement.declarationList.declarations.some((entry) =>
      ts.isIdentifier(entry.name) && entry.name.text === "componentCatalog"),
  );
  if (!declaration || !ts.isVariableStatement(declaration)) throw new Error("Playground componentCatalog must be an explicit array");
  const catalogDeclaration = declaration.declarationList.declarations.find((entry) =>
    ts.isIdentifier(entry.name) && entry.name.text === "componentCatalog",
  );
  const initializer = catalogDeclaration?.initializer;
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) throw new Error("Playground componentCatalog must be an explicit array");

  const allIds = [];
  const installableIds = [];
  for (const entry of initializer.elements) {
    if (!ts.isObjectLiteralExpression(entry)) throw new Error("Playground catalog entries must be explicit metadata objects");
    const property = (name) => entry.properties.find((candidate) =>
      ts.isPropertyAssignment(candidate) &&
      ((ts.isIdentifier(candidate.name) && candidate.name.text === name) ||
       (ts.isStringLiteral(candidate.name) && candidate.name.text === name)),
    );
    const id = property("id")?.initializer;
    if (!id || !ts.isStringLiteral(id) || !componentIdPattern.test(id.text)) {
      throw new Error("Playground catalog entries need a safe, literal component ID");
    }
    allIds.push(id.text);

    const installable = property("installable")?.initializer;
    if (!installable || (installable.kind !== ts.SyntaxKind.TrueKeyword && installable.kind !== ts.SyntaxKind.FalseKeyword)) {
      throw new Error(`Playground installable metadata for ${id.text} must be a boolean literal`);
    }
    if (installable.kind === ts.SyntaxKind.TrueKeyword) installableIds.push(id.text);
  }
  return { allIds, installableIds };
}

export async function verifyRegistry(root = defaultRoot) {
  const { root: absoluteRoot, manifest, records } = await readValidatedManifest(root);
  for (const { file, content } of records) {
    const actualHash = createHash("sha256").update(content).digest("hex");
    if (typeof file.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(file.sha256)) {
      throw new Error(`Invalid SHA-256 value for ${file.source}`);
    }
    if (actualHash !== file.sha256) {
      throw new Error(`Registry SHA-256 mismatch for ${file.source}: expected ${file.sha256}, got ${actualHash}`);
    }
  }

  const catalogPath = join(absoluteRoot, "apps/playground/src/catalog/index.ts");
  const catalogText = await readFile(catalogPath, "utf8");
  const { allIds, installableIds } = findCatalogIds(catalogText, catalogPath);
  if (new Set(allIds.map((id) => id.toLowerCase())).size !== allIds.length) {
    throw new Error("Duplicate component ID in the Playground catalog");
  }
  const registryIds = manifest.items.map((item) => item.name).sort();
  const catalogIds = installableIds.sort();
  if (JSON.stringify(registryIds) !== JSON.stringify(catalogIds)) {
    throw new Error(`Installable Playground IDs (${catalogIds.join(", ")}) do not match Registry items (${registryIds.join(", ")})`);
  }
  return { itemCount: manifest.items.length, fileCount: records.length };
}

export async function syncRegistry(root = defaultRoot) {
  const { root: absoluteRoot, manifest, records } = await readValidatedManifest(root);
  const changed = [];
  for (const { item, file, content } of records) {
    const actualHash = createHash("sha256").update(content).digest("hex");
    if (file.sha256 !== actualHash) {
      changed.push(`${item.name}: ${file.source} (${file.sha256} -> ${actualHash})`);
      file.sha256 = actualHash;
    }
  }

  if (changed.length === 0) return changed;
  await writeFile(join(absoluteRoot, "registry.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return changed;
}

export { defaultRoot };
