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

`apps/playground/src/catalog/index.ts` contains the small list needed by the gallery and route lookup. Each entry has an explicit dynamic loader. `/components/<id>` resolves metadata first; only then does `ComponentDetail.tsx` load that component's entry. The detail entry imports the actual package component, its component CSS, controls and defaults, shared code generation, and the canonical source text. Loading failures can be retried, and stale asynchronous loads are ignored after navigation.

`ComponentGallery.tsx` renders static preview artwork and metadata, so opening `/` does not mount component implementations or load component source text. Vite's production manifest check verifies that Envelope Reveal code and source text remain outside the initial JavaScript graph and that its detail entry is emitted dynamically.

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
- `apps/playground/src/catalog/entries/` contains component-specific Playground configuration and imports.
- `apps/playground/src/catalog/codegen.ts` contains generic registration and usage-code serialization.
- `apps/playground/src/ComponentDetail.tsx` owns shared lazy loading and editor UI.
- `tests/consumers/` validates built-package and copied-source React consumption independently.
- `scripts/` contains Registry hash synchronization and read-only verification.

## Add another component

1. Implement it once under `packages/interactive/src/components/<id>/`.
2. Add its package exports, Vite entry, declaration include, and copied asset entries as described in [Adding components](../adding-components.md).
3. Add a component-specific lazy detail entry under `apps/playground/src/catalog/entries/`.
4. Add lightweight metadata and the dynamic loader to `apps/playground/src/catalog/index.ts`.
5. If it is installable, add its canonical files to `registry.json`, then run `npm run registry:sync` and `npm run test:registry`.
6. Add focused tests and build both independent consumer paths with `npm run build`.

No shared page component needs a component-specific edit. The catalog remains explicit and small; there is no filesystem discovery or general schema framework.

## Rendering contracts

DOM components do not need a Stage. Stage/View contracts remain in `packages/interactive/src/core/` and are documented in [Rendering Foundations](rendering-foundations.md). They are type-only boundaries for future work; this repository does not implement a Three.js runtime. The Playground gallery does not initialize a GPU renderer.
