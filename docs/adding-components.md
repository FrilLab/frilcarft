# Adding a component

This guide describes the working Envelope Reveal workflow. Keep a new component self-contained in `packages/interactive` and register its controls, preview, code generator, and source files in the Playground catalog.

## 1. Implement the component

Create a folder under `packages/interactive/src/components/<component-name>/`. Keep the React implementation, stylesheet, and barrel together:

```text
packages/interactive/src/components/<component-name>/
  ComponentName.tsx
  component-name.css
  index.ts
```

Implement the public interface in React + TypeScript. Keep DOM components independent of Three.js, Canvas, and Stage. Import CSS as a separate package subpath so applications can choose where to load it.

## 2. Define public properties

Export a props interface from the component file and re-export the component and type from `index.ts`. Prefer explicit, optional props with defaults inside the component. Use native controls and text rendering; avoid `innerHTML` and extra animation dependencies.

## 3. Build the package entry

Add the component export and stylesheet subpath to `packages/interactive/package.json`. Add its JavaScript entry in `packages/interactive/vite.config.ts`, include its source in `packages/interactive/tsconfig.build.json`, and extend `packages/interactive/scripts/copy-assets.mjs` to copy its stylesheet into `dist`. Keep each component's export and CSS subpath explicit so the Envelope Reveal export stays independent.

Package `development` export conditions point Vite to workspace source for HMR. The default/import conditions point to built files in `dist`. `npm run build` builds the library before the Playground and consumer fixture.

## 4. Register it in the catalog

Add one typed entry to `apps/playground/src/catalog.tsx` with a stable ID, display name, description, category, component preview, default property values, and controls. The `registerComponent` helper checks the control keys against the property type. Use the existing text, textarea, and color control kinds where they fit.

The catalog entry provides `generateUsageCode(props)` and `sourceText`. Keep this component-specific wiring in the catalog entry; shared Playground code handles navigation, controls, rendering, and copying.

## 5. Generate usage code

Build the usage snippet from the current property values using the existing `createUsageCode` helper. It serializes values as JavaScript string literals, escapes line separators, omits properties that match their defaults, and uses the package's explicit workspace subpath. Keep the note in the UI that the private workspace package is not published. Do not evaluate generated code.

If the component has different value types, extend the narrow typed helper and add focused escaping/formatting tests before registering it.

## 6. Expose source files for copying

Import the actual `.tsx`, barrel, and license files with Vite's `?raw` query in `catalog.tsx`. Import CSS with the Playground's `?sourceText` query, handled by `apps/playground/source-file-plugin.ts`; the plugin reads the current CSS file at build time without transforming or duplicating it. This avoids hand-maintained source strings. Include instructions for each copied filename, all runtime dependencies, and the root MIT license notice. Do not expose a copy action unless it contains every file needed to use the component.

## 7. Add tests

Add focused tests for the component's visible behavior, property updates, keyboard use, and StrictMode/unmount lifecycle. Add Playground tests for catalog display, preview updates, reset, generated usage code (including quotes, backslashes, and newlines), and clipboard contents for usage and source copy. Extend the consumer fixture to import the package export and stylesheet independently.

## 8. Verify locally

From the repository root, run:

```bash
npm install
npm run dev
npm run typecheck
npm run test
npm run build
npm run preview
```

Check the package build, Playground build, and `tests/consumers/react-vite` output. Confirm DOM-only package output has no Three.js import and the stylesheet is emitted. Update the README, component documentation, and architecture notes in the same change. Do not add a second component as part of this guide's reference implementation.
