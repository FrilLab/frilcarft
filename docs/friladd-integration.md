# Install FrilCraft components with FrilAdd

FrilAdd is the recommended way to install FrilCraft components into another project. User-facing commands use npm's `latest` dist-tag. FrilAdd is an independent developer-side CLI: FrilCraft publishes a compatible Registry Manifest, and FrilAdd reads the selected item's declared source files. FrilAdd has no FrilCraft-specific behavior, does not run downloaded code, and does not install npm dependencies.

The package `@frillab/interactive` remains private and unpublished. The installed components are ordinary React source files copied into your project. The canonical implementation files remain under `packages/interactive/src/components/`; `registry.json` points to those files and remains the authoritative list of installable component IDs and destinations.

## Register FrilCraft once for your global setup

Run this command once to make the Registry available across projects and set it as your default:

```bash
npx --yes friladd@latest registry add frilcraft https://raw.githubusercontent.com/FrilLab/frilcraft/main/registry.json --global --default
```

`--global` stores the alias in your user-level FrilAdd configuration. `--default` selects FrilCraft for unqualified component names such as `envelope-reveal`; it can replace an existing default Registry selection. To register FrilCraft globally without changing your current default, omit `--default`:

```bash
npx --yes friladd@latest registry add frilcraft https://raw.githubusercontent.com/FrilLab/frilcraft/main/registry.json --global
```

After registration as the default, install a component from a React project directory with:

```bash
npx --yes friladd@latest add envelope-reveal
```

This short command is the primary Playground instruction. FrilAdd installs only the named Registry item and its declared files.

## Use the explicit Registry alias

If you registered the alias but did not make it the default, select it by name:

```bash
npx --yes friladd@latest add frilcraft/envelope-reveal
```

The qualified form works with either global or project-level alias registration and does not change the configured default.

## Register FrilCraft for one project

From the root of the project where you want to use the component, register the alias without `--global`:

```bash
npx --yes friladd@latest registry add frilcraft https://raw.githubusercontent.com/FrilLab/frilcraft/main/registry.json --default
```

FrilAdd stores project registry settings in `.friladd.json` at that project root. The file can be committed so project collaborators use the same Registry selection. Then run the short `add` command from that project. Project defaults take precedence over global defaults.

## Install once without registering an alias

For a one-time install without persistent FrilAdd configuration, pass the Registry URL directly:

```bash
npx --yes friladd@latest add envelope-reveal --registry https://raw.githubusercontent.com/FrilLab/frilcraft/main/registry.json
```

Use the explicit `--project <directory>` option if you are running FrilAdd from somewhere other than the target project directory.

## Use the component

The current item copies `EnvelopeReveal.tsx`, `index.ts`, `envelope-reveal.css`, and the MIT license notice into `src/components/envelope-reveal/`. In `src/App.tsx`, import the local source and its stylesheet:

```tsx
import { EnvelopeReveal } from "./components/envelope-reveal";
import "./components/envelope-reveal/envelope-reveal.css";

export function Example() {
  return <EnvelopeReveal title="You're invited" />;
}
```

React 18 or 19 is required. No additional component runtime dependency is needed. FrilAdd copies files only; install React in your project if needed.

## Existing files and updates

FrilAdd refuses to overwrite an existing target file. Review the conflicting files, then install into a clean target or move the files you want to replace before retrying. FrilAdd does not automatically update, synchronize, or remove installed components.

The Registry Manifest's SHA-256 values let FrilAdd verify that fetched file bytes match the selected manifest. The digest is not a publisher signature. Review the Registry and component source you choose to install.

## Registry versions and reproducibility

The `main` URL shown above follows the current FrilCraft Registry and may change as components are added or source files are updated. That is convenient for trying the current version, but it is not a fixed version. For reproducible installs, use a Registry URL pinned to an immutable commit SHA (or a release tag that your team keeps immutable), for example:

```text
https://raw.githubusercontent.com/FrilLab/frilcraft/<commit-sha>/registry.json
```

The Registry source paths resolve against that same repository revision. FrilAdd verifies the source bytes against the hashes in that manifest; it does not resolve component versions or update existing copies.

## FrilAdd version selection

Commands for users use `friladd@latest`, which follows npm's current `latest` dist-tag. That tag selects a package version; it does not promise compatibility with future major releases. The independent integration test pins FrilAdd to the published maintenance version `0.1.2`, while Playground commands stay on `@latest`. If a later release changes the CLI commands, update this guide and the Playground command generator.

## Registry integrity and contributor workflow

`registry.json` keeps the FrilAdd Registry Manifest v1 format and points directly to canonical component sources. After changing any listed source file, run:

```bash
npm run registry:sync
npm run test:registry
```

`registry:sync` validates paths and files and updates only changed SHA-256 values. It does not add or remove items and exits without writing when hashes already match. `test:registry` is read-only and verifies hashes, required files, safe paths, unique component IDs and target paths, and consistency between installable Playground IDs and Registry item IDs. CI runs only the verifier, so stale hashes fail instead of being silently repaired.

See [FrilAdd's Registry Manifest v1 format](https://github.com/FrilLab/friladd/blob/main/docs/registry-format.md) for the independent manifest contract and [Adding components](adding-components.md) for the FrilCraft catalog workflow.
