# FrilCraft Project Map

This document describes the implemented source flow.

## Runtime flow

```text
Browser
  |
  v
Playground App
  |
  +-- Gallery
  |     |
  |     +-- Lightweight catalog metadata
  |
  +-- Component Detail
        |
        +-- Lazy-loaded component entry
                |
                +-- Reusable package component
                +-- Property controls
                +-- Usage-code generator
                +-- Source files
                +-- FrilAdd commands
```

`apps/playground/src/catalog/index.ts` contains the small list needed by the gallery and route lookup. Each entry has an explicit dynamic loader and required category and tag metadata. `catalog/metadata.ts` defines the central category labels and curated semantic tag vocabulary; technology badges remain informational. `catalog/filter.ts` builds the categories and tags used by the Gallery from registered entries, filters metadata in memory, and reads and writes shareable query state. Search and filtering never call a detail loader. `/components/<id>` resolves metadata first; only then does `ComponentDetail.tsx` load that component's entry. The detail entry imports the actual package component, controls and defaults, shared code generation, and canonical source text. Tailwind's Playground stylesheet scans both application TSX and reusable component source, so shared utility CSS is available without a per-component CSS file. Loading failures can be retried, and stale asynchronous loads are ignored after navigation.

`ComponentGallery.tsx` renders static preview artwork and metadata, so opening `/` does not mount component implementations or load component source text. Cards link to detail pages and expose clickable semantic tags. Vite's production manifest check verifies that Envelope Reveal JavaScript and raw source remain outside the initial JavaScript graph and that its detail entry is emitted dynamically. Tailwind CSS is compiled into the shared stylesheet from static class names discovered in both the Playground and component source.

The Playground's repeated controls use local shadcn/ui source in `apps/playground/src/components/ui/`, backed by Radix Tabs and Tooltip primitives. `apps/playground/components.json` and the `@/*` aliases are application-only configuration. The library and copied-source contract do not import Playground UI, theme, or Radix code.

## Distribution flow

```text
packages/interactive
        |
        v
registry.json
        |
        v
FrilAdd CLI
        |
        v
Consumer React Project
```

The package source remains canonical. `registry.json` identifies source and target files with SHA-256 values. The independent FrilAdd CLI installs the selected local source files into a consumer project. FrilCraft displays commands but does not resolve Registries, execute the CLI, or install packages in the browser.

## Main directories

- `packages/interactive/` contains the reusable React components and explicit library build configuration.
- `apps/playground/src/catalog/index.ts` contains only gallery metadata and detail loaders.
- `apps/playground/src/catalog/metadata.ts` centralizes stable category IDs, category labels, and curated semantic tags.
- `apps/playground/src/catalog/filter.ts` generates available filters and searches catalog metadata without loading details.
- `apps/playground/src/catalog/entries/` contains component-specific Playground configuration and imports.
- `apps/playground/src/catalog/codegen.ts` contains generic registration and usage-code serialization.
- `apps/playground/src/ComponentDetail.tsx` owns shared lazy loading and editor UI.
- `apps/playground/src/components/ui/` contains Playground-only shadcn/ui controls, customized to FrilCraft's editorial tokens.
- `tests/consumers/` validates built-package and copied-source React consumption independently.
- `scripts/` contains Registry hash synchronization and read-only verification.

## Add another component

1. Implement the React component with Tailwind utilities and `cn` where useful; keep separate CSS only when justified.
2. Register package exports, Vite entries, declaration inputs, and runtime dependencies.
3. Add a component-specific lazy detail entry under `apps/playground/src/catalog/entries/`.
4. Register gallery metadata and semantic tags in the lightweight catalog and centralized taxonomy.
5. If installable, add canonical files to Registry Manifest v1 and synchronize SHA-256 values.
6. Add focused tests and build the independent package and copied-source consumers with Tailwind enabled.
7. Update component, consumer, and architecture documentation in the same change.

No shared page component needs a component-specific edit. The catalog remains explicit and small; there is no filesystem discovery or general schema framework.

## Rendering contracts

DOM components do not need a Stage. Stage/View contracts remain in `packages/interactive/src/core/` and are documented in [Rendering Foundations](rendering-foundations.md). They are type-only boundaries for future work; this repository does not implement a Three.js runtime. The Playground gallery does not initialize a GPU renderer. For a future 3D component, Three.js remains the engine; React Three Fiber is the preferred React integration and Drei can provide optional helpers. Select a stable R3F release compatible with React 19 only when a component needs it. Keep 3D dependencies lazy and separate from DOM components. Tailwind styles HTML overlays, not mesh materials.
