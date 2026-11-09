# FrilCraft contributor rules

FrilCraft is an early prototype. The React-first Envelope Reveal Playground is the first complete component workflow; the package is private and has not been published.

## Documentation and communication

- Write public documentation, README files, code comments, API references, examples, issue descriptions, pull-request descriptions, and release notes in English.
- Keep exported names and terminology consistent across the component, Playground, consumer example, and documentation.
- Update documentation in the same change as public API or architecture changes.
- Describe only implemented behavior. Do not imply that this private package or a Registry is available from npm.
- Preserve the root MIT license and its copyright/permission notice in copies or substantial portions of the software. Check third-party licenses before including code or media.

## Component and dependency boundaries

- React 19 and TypeScript are the primary public component interface for the initial release. Tailwind CSS v4 is the default styling system for Playground and distributed DOM components.
- The Playground may use locally owned shadcn/ui components with one primitive base (Radix for the current setup). Keep its `components.json`, theme tokens, UI source, and dependencies under `apps/playground`; never import those modules from `packages/interactive` or copy them through FrilAdd.
- Prefer the Playground's shared shadcn controls for repeated buttons, inputs, badges, tabs, and tooltips. Customize their local Tailwind classes to preserve FrilCraft's editorial design. Do not add unused controls or a competing class-merging helper.
- Prefer Tailwind utilities and native browser APIs for layout, interaction, and animation. Keep separate CSS only for mechanics that remain clearer there. Do not add Motion, GSAP, or other animation runtime dependencies.
- Import `cn` directly from the `cn` package for conditional classes and Tailwind conflict resolution. Do not maintain a local `clsx`/`tailwind-merge` wrapper.
- A component may include independent Vanilla TypeScript only when it provides real value; a Vanilla API is not required for every React component.
- React is a peer dependency of `@frillab/interactive`; `cn` is a runtime dependency when component source imports it. Tailwind CSS and `@tailwindcss/vite` are consumer build dependencies, not component runtime dependencies.
- External Tailwind consumers must import `@import "tailwindcss";` from their application CSS and make copied component files discoverable with Tailwind's automatic scanning or an explicit `@source` directive. FrilAdd does not configure Tailwind or install npm dependencies.
- Shadcn/Radix Playground dependencies are not consumer dependencies. Distributed components must remain independent from Playground UI modules and theme files.
- Three.js is reserved for components that need 3D. DOM components must not import Three.js, create a Canvas, or require a Stage.
- Keep the Registry optional. Components must not depend on the Playground, FrilStudio, analytics, or remote services.
- Keep the component catalog explicit and small. Do not add discovery systems, general schema frameworks, or runtime code execution.
- Playground catalog entries require one stable category ID, curated semantic tags, and noninteractive technology badges. Keep category labels and the curated tag vocabulary centralized in `apps/playground/src/catalog/metadata.ts`; derive visible category and tag filters from registered metadata.

## Rendering architecture

- A Stage may own at most one Canvas and one Renderer.
- Only explicit Stage creation may allocate a GPU Canvas; a View or Scene must not allocate one.
- Register multiple Views within a Stage. Replacing a Scene must not recreate the Stage Canvas or Renderer.
- Creating another Stage for the same host must fail clearly. Explicit separate hosts may own separate Stages.
- Frame scheduling, event routing, and GPU resource disposal belong to the Stage/runtime layer.
- Never dispose shared GPU resources while another View still uses them.
- DOM-only components do not need a Stage.

See [rendering foundations](docs/architecture/rendering-foundations.md) before changing rendering contracts. Those contracts are future-facing type/design boundaries; this task does not implement a Three.js runtime.

For a future 3D component, Three.js remains the rendering engine, React Three Fiber is the preferred React integration, and Drei is optional. Select a stable R3F release compatible with React 19 when a real 3D component needs it; do not install or initialize these packages for DOM-only components. Tailwind styles HTML overlays, not mesh materials. Keep Canvas allocation, lazy loading, and resource lifecycle explicit.

## API, lifecycle, and validation

- React owns React component markup and lifecycle. Components must behave under StrictMode remounts and clean up resources they allocate.
- Keep GPU and Three.js types out of general DOM component APIs.
- Do not promise that Three.js Scenes can automatically run on a direct WebGPU backend.
- Do not publish dummy methods that imply an unimplemented feature exists. Mark type-only contracts clearly.
- Complete public behavior, docs, cleanup, and focused tests together.
- Verify independent React consumption and CSS access for distributed components. Do not treat a subpath export alone as proof of tree shaking.
- Distributed components must not contain hidden analytics or tracking calls.

## Current component distribution workflow

- Keep package exports, build entries, declarations, optional copied CSS assets, Playground registration, and source-consumer validation explicit for each component. The current package has one component; do not add a generator for a few explicit build entries.
- Keep `apps/playground/src/catalog/index.ts` limited to gallery metadata and lazy detail loaders. Put each implementation import, any justified stylesheet import, defaults, controls, usage paths, and actual source-file imports in `catalog/entries/<id>.tsx`. Keep shared JSX serialization in `catalog/codegen.ts` and shared rendering in `ComponentDetail.tsx`.
- Gallery categories, semantic tags, and technology badges are distinct metadata. Category is a single machine-readable primary classification; tags are multiple curated, searchable semantic identifiers with AND filtering; badges are display-only technologies. Generate options from registered catalog entries, keep search and filtering within metadata, and never call a detail loader from the Gallery.
- Use `import()` for component detail entries. Do not import component implementations, CSS, or raw component source from the lightweight catalog or the Playground app shell.
- The gallery must list every catalog registration and each card must link to `/components/<id>`. Keep all component-specific page data in the catalog; do not hardcode component names in shared page components.
- Use static gallery artwork where available, not a live mount of every component; GPU components must not initialize merely because the gallery is open.
- Keep source files sourced from the component directory with Vite raw-file imports; do not duplicate implementation text in the Playground.
- Label workspace package usage as private and unpublished. External usage examples must import copied local source files and any required stylesheet. Components using Tailwind must document its v4 Vite setup and source scanning requirements.
- Preserve the root MIT license in source copies. Validate both the built package consumer and the isolated source consumer with Tailwind CSS emitted from the appropriate component source.
- After editing Registry source files, run `npm run registry:sync` and then `npm run test:registry`. The verifier is read-only; CI must detect stale hashes without repairing them.
- Keep the FrilAdd integration test pinned to the verified `0.1.2`; user-facing commands remain on `friladd@latest`.
- FrilAdd is an independent project. Do not add CLI implementation, remote fetching, package installation, or Registry resolution to FrilCraft. FrilCraft may publish a compatible Registry Manifest and display commands that invoke a versioned FrilAdd CLI; this does not add a browser runtime dependency.
