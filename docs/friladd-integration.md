# Install FrilCraft components with FrilAdd

**Status:** this repository defines a FrilAdd Registry v1 manifest, but the `friladd` npm package is not confirmed published. Use the Rust CLI from [FrilAdd](https://github.com/FrilLab/friladd) until a verified release is available.

The single source of truth is `packages/interactive/src/components/`. The root `registry.json` points directly to those source files; it does **not** maintain a second implementation.

## Local end-to-end smoke test

Clone FrilAdd and FrilCraft as sibling repositories. From the FrilAdd directory:

```bash
mkdir -p ../friladd-consumer
cargo run -- add envelope-reveal \
  --registry ../frilcarft/registry.json \
  --project ../friladd-consumer \
  --dry-run

cargo run -- add envelope-reveal \
  --registry ../frilcarft/registry.json \
  --project ../friladd-consumer
```

The second command installs `EnvelopeReveal.tsx`, `index.ts`, `envelope-reveal.css`, and the component's MIT `LICENSE` notice under `src/components/envelope-reveal/`. Never run it twice into the same directory without first removing the already-installed files: FrilAdd refuses overwrites.

## Remote Registry

Once this manifest is merged, the GitHub raw URL of the manifest can be used:

```text
https://raw.githubusercontent.com/FrilLab/frilcarft/main/registry.json
```

For reproducible installation prefer a specific immutable commit SHA or release tag in place of `main`. The remote manifest's relative paths resolve against that same GitHub raw repository revision.

## After installation

Install React 18/19 in your consumer project if it is not already available. FrilAdd copies files only; it does not install npm dependencies or run scripts.

```tsx
import { EnvelopeReveal } from "./components/envelope-reveal";
import "./components/envelope-reveal/envelope-reveal.css";

export function App() {
  return <EnvelopeReveal title="You're invited" />;
}
```

`--project` must point to an existing project directory. For the current component, no other runtime library besides React is required.

## Updating components

When a source file changes, update the matching SHA-256 value in `registry.json`. Validate before committing:

```bash
npm run test:registry
```

The CI workflow runs the same check. Keep this manifest compatible with [FrilAdd Registry v1](https://github.com/FrilLab/friladd/blob/main/docs/registry-format.md). Do not confuse this file with a shadcn Registry manifest; they are different formats.

When registering more components, list only the files each component genuinely needs. If you add a local import, include its source file in the corresponding manifest item.
