#!/usr/bin/env bash
set -euo pipefail

# Real FrilAdd install test, completely outside the FrilCraft workspace.
: "$FRILADD_BIN"
ROOT="$PWD"
TEMP="$(mktemp -d)"
trap 'rm -rf "$TEMP"' EXIT
CONSUMER="$TEMP/consumer"
mkdir -p "$CONSUMER"

echo "Validate dry-run without project writes"
"$FRILADD_BIN" add envelope-reveal --registry "$ROOT/registry.json" --project "$CONSUMER" --dry-run
test "$(find "$CONSUMER" -type f | wc -l | tr -d ' ')" = "0"

echo "Install original FrilCraft component files"
"$FRILADD_BIN" add envelope-reveal --registry "$ROOT/registry.json" --project "$CONSUMER"

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
console.log("FrilAdd installed the exact four declared files.");
NODE

echo "Check that a repeated add refuses an overwrite"
if "$FRILADD_BIN" add envelope-reveal --registry "$ROOT/registry.json" --project "$CONSUMER"; then
  echo "ERROR: repeated installation unexpectedly succeeded" >&2
  exit 1
fi

cat > "$CONSUMER/package.json" <<'JSON'
{
  "name": "friladd-independent-react-consumer",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": { "build": "tsc --noEmit && vite build" }
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
cat > "$CONSUMER/src/main.tsx" <<'TSX'
import { createRoot } from "react-dom/client";
import { EnvelopeReveal } from "./components/envelope-reveal";
import "./components/envelope-reveal/envelope-reveal.css";

const element = document.getElementById("root");
if (!element) throw new Error("Missing root element");
createRoot(element).render(
  <EnvelopeReveal title="FrilAdd independent consumer verification" />,
);
TSX

echo "Install React and build with independent consumer dependencies"
(
  cd "$CONSUMER"
  npm install --no-audit --no-fund --save-exact \
    react@19.2.0 react-dom@19.2.0 \
    vite@8.3.0 typescript@5.9.3 \
    @types/react@19.2.0 @types/react-dom@19.2.0
  npm run build
)
test -f "$CONSUMER/dist/index.html"
test -n "$(find "$CONSUMER/dist/assets" -name '*.js' -print -quit)"
test -n "$(find "$CONSUMER/dist/assets" -name '*.css' -print -quit)"
if grep -RE '@frillab/interactive|from .three' "$CONSUMER/src/components"; then
  echo "ERROR: installed component requires FrilCraft workspace or Three.js" >&2
  exit 1
fi

if [[ -n "$FRILADD_REGISTRY_URL" ]]; then
  echo "Install from the pinned remote HTTPS manifest"
  REMOTE="$TEMP/remote"
  mkdir -p "$REMOTE"
  "$FRILADD_BIN" add envelope-reveal --registry "$FRILADD_REGISTRY_URL" --project "$REMOTE"
  node --input-type=module - "$ROOT" "$REMOTE" <<'NODE'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const [root, remote] = process.argv.slice(2);
const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf8"));
for (const file of registry.items.find(i => i.name === "envelope-reveal").files) {
  assert.deepEqual(readFileSync(join(remote, file.target)), readFileSync(join(root, file.source)));
}
console.log("Remote source installation matches the original files.");
NODE
fi
echo "FrilAdd add and independent React consumer build passed."
