#!/usr/bin/env bash
set -euo pipefail

# Exercise the published FrilAdd CLI in isolated user and project directories.
ROOT="$PWD"
TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
export HOME="$TEMP/home"
export XDG_CONFIG_HOME="$TEMP/config"
export NPM_CONFIG_CACHE="$TEMP/npm-cache"
export NPM_CONFIG_USERCONFIG="$TEMP/npmrc"
mkdir -p "$HOME" "$XDG_CONFIG_HOME"

FRILCRAFT_REGISTRY_URL="${FRILADD_REGISTRY_URL:-$ROOT/registry.json}"
CONSUMER="$TEMP/consumer"
mkdir -p "$CONSUMER"

friladd() {
  npx --yes friladd@0.1.2 "$@"
}

echo "Verify the pinned published CLI and register the FrilCraft Registry globally in isolated config"
test "$(friladd --version)" = "friladd 0.1.2"
friladd registry add frilcraft "$FRILCRAFT_REGISTRY_URL" --global --default

echo "Validate dry-run through the configured default Registry without project writes"
friladd add envelope-reveal --project "$CONSUMER" --dry-run
test "$(find "$CONSUMER" -type f | wc -l | tr -d ' ')" = "0"

echo "Install from the default Registry without --registry"
friladd add envelope-reveal --project "$CONSUMER"

node --input-type=module - "$ROOT" "$CONSUMER" <<'NODE'
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
const [root, consumer] = process.argv.slice(2);
const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf8"));
const item = registry.items.find(entry => entry.name === "envelope-reveal");
assert.ok(item);
const expected = item.files.map(file => file.target).sort();
const actual = [];
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.isFile()) actual.push(relative(consumer, absolute).split("\\").join("/"));
    else throw new Error("Unexpected special file: " + absolute);
  }
}
walk(consumer);
assert.deepEqual(actual.sort(), expected);
for (const file of item.files) {
  assert.deepEqual(
    readFileSync(join(consumer, file.target)),
    readFileSync(join(root, file.source)),
    "Installed bytes differ for " + file.target,
  );
}
console.log(`FrilAdd installed all ${expected.length} manifest files with exact source bytes.`);
NODE

echo "Check that the explicit Registry alias also installs the selected component"
ALIAS_CONSUMER="$TEMP/alias-consumer"
mkdir -p "$ALIAS_CONSUMER"
friladd add frilcraft/envelope-reveal --project "$ALIAS_CONSUMER"
node --input-type=module - "$ROOT" "$ALIAS_CONSUMER" <<'NODE'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const [root, consumer] = process.argv.slice(2);
const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf8"));
for (const file of registry.items.find(item => item.name === "envelope-reveal").files) {
  assert.deepEqual(readFileSync(join(consumer, file.target)), readFileSync(join(root, file.source)));
}
console.log("Qualified alias install matches the Registry Manifest.");
NODE

echo "Check that a repeated add refuses to overwrite installed files"
if friladd add envelope-reveal --project "$CONSUMER"; then
  echo "ERROR: repeated installation unexpectedly succeeded" >&2
  exit 1
fi

cat > "$CONSUMER/package.json" <<'JSON'
{
  "name": "friladd-independent-react-consumer",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": { "build": "tsc --noEmit && vite build" },
  "dependencies": {
    "cn": "^0.5.2",
    "react": "^19.3.1",
    "react-dom": "^19.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.5",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "tailwindcss": "^4.3.5",
    "typescript": "^7.0.2",
    "vite": "^8.3.6"
  }
}
JSON
cat > "$CONSUMER/tsconfig.json" <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "noEmit": true
  },
  "include": ["src"]
}
JSON
cat > "$CONSUMER/index.html" <<'HTML'
<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8"/><title>FrilAdd independent consumer</title></head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>
HTML
mkdir -p "$CONSUMER/src"
cat > "$CONSUMER/src/main.tsx" <<'TSX'
import { createRoot } from "react-dom/client";
import { EnvelopeReveal } from "./components/envelope-reveal";
import "./consumer.css";

const element = document.getElementById("root");
if (!element) throw new Error("Missing root element");
createRoot(element).render(
  <EnvelopeReveal title="FrilAdd independent consumer verification" />,
);
TSX
cat > "$CONSUMER/src/consumer.css" <<'CSS'
@import "tailwindcss";

@source "./components/envelope-reveal";
CSS
cat > "$CONSUMER/vite.config.ts" <<'TS'
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({ plugins: [tailwindcss(), react()] });
TS

echo "Install pinned React consumer tooling and build the independent project"
(
  cd "$CONSUMER"
  npm install --no-audit --no-fund --save-exact \
    react@19.3.1 react-dom@19.3.1 cn@0.5.2 \
    vite@8.3.6 typescript@7.0.2 \
    tailwindcss@4.3.5 @tailwindcss/vite@4.3.5 \
    @vitejs/plugin-react@6.3.0 \
    @types/react@19.3.0 @types/react-dom@19.3.0
  npm run build
)
test -f "$CONSUMER/dist/index.html"
test -n "$(find "$CONSUMER/dist/assets" -name '*.js' -print -quit)"
test -n "$(find "$CONSUMER/dist/assets" -name '*.css' -print -quit)"
if grep -RE '@frillab/interactive|from .three|@react-three/(fiber|drei)' "$CONSUMER/src/components"; then
  echo "ERROR: installed component requires FrilCraft workspace or Three.js" >&2
  exit 1
fi
if ! grep -R -q 'perspective:850px' "$CONSUMER/dist/assets"/*.css; then
  echo "ERROR: Tailwind did not emit the copied Envelope Reveal styling" >&2
  exit 1
fi

echo "FrilAdd 0.1.2 installation and independent React consumer build passed."
