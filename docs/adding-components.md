# Adding a component

This guide describes the explicit React component workflow. Component implementations have one canonical home in `packages/interactive`; the Playground previews those components and exposes their actual source files. The gallery reads small metadata records and loads a component's detail entry only after its route is selected.

## 1. Implement the reusable component

Create `packages/interactive/src/components/<id>/` with the React implementation, an optional stylesheet, and an `index.ts` barrel:

```text
packages/interactive/src/components/<id>/
  ComponentName.tsx
  component-name.css
  index.ts
```

Export the component and its props interface from the barrel. React owns markup and lifecycle; use CSS and native browser APIs for DOM interactions. DOM components must not depend on Three.js, Canvas, Stage, the Playground, analytics, or remote services.

## 2. Add the explicit package build entries

Update `packages/interactive/package.json` with the component source in the package `files` list plus its JavaScript and optional CSS subpath exports. Add the component's source entry to `packages/interactive/vite.config.ts`, its TypeScript files to `packages/interactive/tsconfig.build.json`, and any emitted static assets to `packages/interactive/scripts/copy-assets.mjs`. Keep React external and a peer dependency.

These files are deliberately explicit. For this prototype, adding a few clear entries is easier to maintain than a build generator. Add only the dependencies the component needs; Three.js must stay out of DOM-only entries.

## 3. Add a lazy Playground entry and lightweight metadata

Create `apps/playground/src/catalog/entries/<id>.tsx`. This component-specific file imports the real package component, its stylesheet, the real implementation files for copy, defaults, controls, source-copy instructions, and preview details. Import source text with Vite `?raw` for TypeScript and `?sourceText` for CSS; do not duplicate source strings.

Use the shared `registerComponent` helper from `catalog/codegen.ts` to create the detail registration. Configure both the private workspace import paths and copied-source import paths. Configure each editable value once in the default properties and controls; the shared generator serializes string, number, and boolean props, omits unchanged defaults and undefined values, and produces separate workspace and copied-source examples.

Then add one object to `apps/playground/src/catalog/index.ts` with only the stable ID, display name, description, category, badges, installable flag, static preview image, and lazy loader:

```ts
{
  id: "sample-card",
  name: "Sample Card",
  description: "A reusable React card.",
  category: "Interactive",
  badges: ["React", "CSS"],
  installable: false,
  previewImage: "/previews/sample-card.svg",
  load: async () => (await import("./entries/sample-card.js")).componentDetail,
}
```

Do not import the component, CSS, or raw source files from this catalog. Its metadata adds a gallery card and resolves `/components/<id>` without changing `App.tsx`, `ComponentGallery.tsx`, or `ComponentDetail.tsx`. The Gallery uses the static preview image and does not mount components.

## 4. Add source-copy files and installation instructions

List each actual file required by the copied-source example in the detail entry. Include the root `LICENSE` so copies retain the MIT notice. `sourceInstructions` should identify the destination, where the example is assumed to live, and any runtime dependency. The UI displays and copies each file separately.

Workspace examples import the private, unpublished `@frillab/interactive` package. Copied-source examples import local files and their stylesheet; this is the supported external example while the package remains unpublished. Do not show an npm install command for this private package.

## 5. Register installable files in the FrilAdd manifest

If the component can be installed, add its source files and targets to root `registry.json` using Registry Manifest v1. Keep sources canonical under `packages/interactive/src/components/`; do not add a duplicate implementation. Use safe, unique paths. The Registry item ID must match the Playground metadata ID, and its targets must match the files and imports described by the detail entry.

After editing source files or the manifest, run:

```bash
npm run registry:sync
npm run test:registry
```

`registry:sync` preserves the existing item structure and updates only stale SHA-256 values from source bytes. It rejects unsafe paths and missing files, does not add or remove items, and prints changed hashes. It makes no file changes when hashes are already current. `test:registry` is read-only and checks hashes, missing/unsafe paths, duplicate IDs and targets, and installable catalog ID consistency. CI runs verification only and fails on stale hashes.

## 6. Validate the package and Playground

Add focused tests for component behavior, accessibility, properties, and lifecycle. Verify the installed package and copied-source consumer with `npm run build`. The Playground build also checks its Vite production manifest: the initial Gallery's static module graph must not include component implementations, component-specific CSS, raw source text, or Three.js; the component detail must appear in its own dynamic chunk.

The current consumer fixtures are explicit Envelope Reveal examples. When adding a component, include its built-package import and CSS checks in `tests/consumers/react-vite/` and its real copied files in `tests/consumers/source-vite/build.mjs`; keep those consumers isolated from the private workspace package where appropriate. Update the FrilAdd integration workflow paths if it must run for the new source files.

Run the repository validation:

```bash
npm ci
npm run typecheck
npm run test
npm run registry:sync
npm run test:registry
npm run build
```

The independent FrilAdd integration workflow uses published `friladd@0.1.2`. Playground commands shown to users continue to use `friladd@latest`.
