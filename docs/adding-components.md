# Adding a component

This guide describes FrilCraft's React-first component workflow. Component implementations have one canonical home in `packages/interactive`; the Playground previews those files and exposes their real source for copying. Gallery metadata stays lightweight and detail modules load only when their route is selected.

## 1. Implement the React component

Create `packages/interactive/src/components/<id>/` with a React 19 and TypeScript implementation, an `index.ts` barrel, focused tests, and a separate stylesheet only when the component's mechanics remain clearer in CSS:

```text
packages/interactive/src/components/<id>/
  ComponentName.tsx
  index.ts
  ComponentName.test.tsx
```

Use Tailwind CSS v4 utilities for DOM layout, spacing, typography, colors, and common states. Import `cn` directly from `cn` when conditional classes or consumer overrides need Tailwind-aware merging. Keep class names static so consumer Tailwind builds can discover them. Use CSS custom properties for caller values that cannot be statically known, such as colors. React owns markup and lifecycle; use native browser behavior for interaction. DOM components must not depend on Three.js, Canvas, Stage, the Playground, analytics, or remote services.

The Playground may use its local shadcn/ui controls for search, filters, property editing, code tabs, and copy actions. `apps/playground/components.json` selects Radix-backed implementations, and the UI source lives under `apps/playground/src/components/ui/`. Do not import these controls, aliases, theme files, or dependencies into `packages/interactive`; FrilAdd copies reusable component source only. External consumers do not need shadcn/ui or Radix for Envelope Reveal.

## 2. Register package build entries and dependencies

Update `packages/interactive/package.json` with explicit exports and source files. Add the entry to `packages/interactive/vite.config.ts` and its TypeScript declaration inputs to `packages/interactive/tsconfig.build.json`. Register only justified static assets in the copy script. Keep React external as a peer dependency and declare every component runtime import in the package's `dependencies`. Tailwind CSS and `@tailwindcss/vite` belong to consumer build tooling, not the component runtime. Do not install Three.js, React Three Fiber, or Drei for DOM components.

Keep these entries explicit; a few understandable package entries do not need a generator.

## 3. Add the lazy Playground entry and metadata

Create `apps/playground/src/catalog/entries/<id>.tsx`. Keep implementation imports, defaults, controls, usage paths, source-copy instructions, and actual source-file imports in that component detail file. Import component source text with Vite `?raw` from its canonical file; do not duplicate implementation text.

Use `registerComponent` from `catalog/codegen.ts`. CSS import paths are optional: add them only when the component has a real separate stylesheet. The shared generator omits the CSS import from generated examples when no path is configured.

Add one object to `apps/playground/src/catalog/index.ts` with only stable gallery metadata and a dynamic loader:

```tsx
{
  id: "sample-card",
  name: "Sample Card",
  description: "A reusable React card.",
  category: "interaction",
  tags: ["click", "reveal"],
  badges: ["React", "Tailwind"],
  installable: false,
  previewImage: "/previews/sample-card.svg",
  load: async () => (await import("./entries/sample-card.js")).componentDetail,
}
```

`category` is one stable primary classification from `catalog/metadata.ts`; `tags` are multiple curated semantic identifiers and use AND filtering; `badges` are display-only technology labels. Add only taxonomy values that a registered component uses. Search, categories, and tags operate on metadata and never call detail loaders. Gallery previews use static artwork instead of mounting every component.

## 4. Document copied-source consumption

List the actual component files in the detail entry and include the root `LICENSE` so redistributed copies retain the MIT notice. Source examples must import local copied files, not the private workspace package. Clearly document React as a peer dependency, every runtime package such as `cn`, Tailwind CSS v4, the Vite plugin, Tailwind source scanning, required CSS imports, and any external runtime library.

For a Tailwind component, downstream setup should show the official Vite plugin and application CSS entry:

```bash
npm install cn
npm install -D tailwindcss @tailwindcss/vite
```

```ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({ plugins: [tailwindcss()] });
```

```css
@import "tailwindcss";
@source "./components/sample-card";
```

FrilAdd copies declared source files only. It does not install these dependencies, set up Vite, or configure Tailwind.

## 5. Register the FrilAdd source files

For installable components, add canonical files and consumer targets to root `registry.json` using the existing FrilAdd Registry Manifest v1 schema. Keep sources under `packages/interactive/src/components/`, use safe unique paths, and keep the item ID aligned with the Playground metadata. Do not add Playground-only metadata to the Registry.

After editing Registry-listed source files or file lists, run:

```bash
npm run registry:sync
npm run test:registry
```

`registry:sync` updates only SHA-256 values after validating paths and files. `test:registry` is read-only and checks hashes, paths, IDs, targets, and installable catalog consistency. CI runs verification only.

## 6. Validate independent consumption

Add focused tests for defaults, behavior, accessibility, overrides, lifecycle, and reduced motion. The source consumer must copy the actual files into an isolated project, configure Tailwind, import its CSS entry and local component, typecheck the source, build with Vite, and verify emitted component utilities. The package consumer must build the generated package output with Tailwind scanning the imported package code. Keep both consumers independent of the private package as appropriate; the copied-source path must not import it. Check that React is not duplicated and DOM bundles contain no Three.js, R3F, or Drei.

The Playground production bundle check must confirm that Gallery JavaScript does not include the implementation or raw source, and that the detail entry remains a separate dynamic chunk. Tailwind utility CSS may live in the shared application stylesheet because it is generated from statically scanned source files.

## Standard workflow

1. Implement the React component.
2. Use Tailwind CSS and `cn` where useful; keep separate CSS only when justified.
3. Register package exports and declaration/build inputs.
4. Register the Playground detail entry and catalog metadata.
5. Add semantic tags from the centralized vocabulary.
6. Update the FrilAdd Registry Manifest v1 file list when the component is installable.
7. Synchronize and verify SHA-256 values.
8. Test source and package consumption independently.

Run the repository checks from the root:

```bash
npm ci
npm run typecheck
npm run test
npm run registry:sync
npm run test:registry
npm run build
```

The FrilAdd integration workflow stays pinned to the verified `0.1.2`; user-facing install commands use `friladd@latest`.
