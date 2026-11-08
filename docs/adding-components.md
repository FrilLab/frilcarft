# Adding a component

This guide describes the current React component workflow. Keep each component's implementation and public files in `packages/interactive`, then make one explicit Playground catalog registration. The Playground preview imports the library component; its usage snippets and source files are separately configured in that registration.

## 1. Create the component source

Add a directory under `packages/interactive/src/components/<component-name>/` containing its React implementation, stylesheet when needed, and `index.ts` barrel:

```text
packages/interactive/src/components/<component-name>/
  ComponentName.tsx
  component-name.css
  index.ts
```

Export the props interface and component from the barrel. Use React + TypeScript for the public component API. React owns markup and lifecycle; use CSS and native browser behavior for DOM interactions. Keep DOM components independent of Canvas, Stage, the Playground, analytics, and remote services.

## 2. Expose the package entrypoint

Add explicit JavaScript and CSS subpaths to `packages/interactive/package.json`. Point the `development` condition to the component source and the normal import/default conditions to built output. Point the `types` condition to the declaration emitted in `dist/types/`.

Add the component JavaScript entry to `packages/interactive/vite.config.ts`, its TypeScript files to `packages/interactive/tsconfig.build.json`, and any emitted static files to `packages/interactive/scripts/copy-assets.mjs`. These lists are explicit by design. React is a peer dependency and must stay external in the library build.

The Playground resolves the development condition for live source updates. Production applications resolve the built package entry. Import the CSS subpath separately so consumers can choose where to load the stylesheet.

## 3. Register the preview and controls

Add one typed registration in `apps/playground/src/catalog.tsx`. Configure the stable ID, display name, description, category, component name, package imports, copied-source imports, actual component preview, default property values, and controls. Control kinds currently include text, textarea, color, number, and boolean.

For example, the registration explicitly provides `componentName: "ComponentName"`, its `workspaceImportPath`, its `workspaceCssImportPath`, and a `Preview` imported from the package. Put component-specific preview badges, optional hint text, and feature notes in that same registration. The shared shell reads this metadata and does not name individual components.

Use a control for each value that should be editable and included in generated examples. The generic generator omits properties equal to registered defaults and undefined optional values, and serializes strings, finite numbers, and booleans as JSX expressions. It does not evaluate generated code.

## 4. Configure usage-code generation

Set `componentName`, `workspaceImportPath`, and `workspaceCssImportPath` for private workspace examples. Set `sourceImportPath` and `sourceCssImportPath` to the local paths that match the copied-file instructions. The registration uses the shared `createUsageCode` formatter for both targets.

The Playground labels these outputs separately:

- **Workspace Usage** imports `@frillab/interactive` and is only usable inside this private repository workspace.
- **Copied Source Usage** imports files from the consumer's project and is the example to use outside this repository while the package remains unpublished.

Do not add an npm installation command for this private package.

## 5. Expose the actual source files

Add each file needed to use the component to the registration's `sourceFiles` list. Import TypeScript and barrel files with Vite's `?raw` query. Import CSS with `?sourceText`, handled by `apps/playground/source-file-plugin.ts`, which reads the current source file in development and production builds. Import the root `LICENSE` for the MIT notice. Do not hand-copy implementation strings into the Playground.

Set `sourceInstructions` to explain the target directory, assumptions in the usage snippet, and runtime dependencies. Show and copy each source file separately. Include the stylesheet, barrels, helper files, assets, and license needed by that component; do not expose Playground-only dependencies or imports.

For the current component, copy `EnvelopeReveal.tsx`, `index.ts`, `envelope-reveal.css`, and `LICENSE` into `src/components/envelope-reveal/`. The generated example imports from `./components/envelope-reveal` and imports its stylesheet separately.

## 6. Add focused validation

Add tests for the component's behavior, accessibility, prop updates, and lifecycle. Add Playground tests for actual preview rendering, live control updates, reset, source-file copy actions, and generated TSX. Use a small synthetic registration to verify that the generic generator honors component names, both import paths, default omission, string escaping, numeric props, and boolean props.

Verify both consumer paths:

- `tests/consumers/react-vite/` builds the built workspace package and its CSS export.
- `tests/consumers/source-vite/build.mjs` copies the actual component files into a temporary isolated React app and builds local source imports without the workspace package.

Confirm DOM component output does not import Three.js. Do not add Stage/View runtime behavior for DOM components.

## 7. Run the repository checks

From a clean checkout, run:

```bash
npm ci
npm run typecheck
npm run test
npm run build
npm run dev
npm run preview
```

Run the dev and preview servers long enough to confirm they serve the Playground; preview requires a production build first. Update the README and component documentation alongside public API or workflow changes. Keep the component catalog explicit and do not add discovery systems, a Registry dependency, FrilAdd, or another component solely to exercise the workflow.
