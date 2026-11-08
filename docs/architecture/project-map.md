# FrilCraft Project Map

This document explains the current source code flow, not a proposed framework.

## Three responsibilities

1. **`packages/interactive/` — implementation.** `src/components/envelope-reveal/EnvelopeReveal.tsx` implements the React behavior and `envelope-reveal.css` supplies styles. This package has no dependency on the Playground.
2. **`apps/playground/` — demonstration and customization.** `catalog.tsx` registers the component, editable properties, package import paths, copied-source paths, and source files. `ComponentGallery.tsx` lists all registered components. `ComponentDetail.tsx` displays the live preview, controls, and code-copy actions. `App.tsx` selects the page using the URL and renders the shared navigation shell.
3. **`tests/consumers/` — external usage validation.** One test builds the package consumer and another copies the actual source and stylesheet into a separate React app. These are tests, not another public demo.

## Open the application

```bash
npm ci
npm run dev
```

Visit `http://localhost:5173/` for the gallery or `http://localhost:5173/components/envelope-reveal` for a direct link to the editor. Selecting a card changes the URL, and browser back/forward works. The Playground does not need a backend or a database.

## Add another component

1. Add its React source and styles under `packages/interactive/src/components/<id>/`.
2. Add the package subpath exports and build entries as described in [Adding components](../adding-components.md).
3. Add one registration to `apps/playground/src/catalog.tsx`. Include a stable ID, preview component, controls, code import paths, and files that must be copied. Optionally add a static preview image to `apps/playground/public/previews/`.
4. The gallery automatically lists the registration, and `/components/<id>` opens its editor. No separate page or router entry is necessary.
5. Add tests and verify both external consumption paths.

## Why the gallery does not mount component previews

The catalog provides static preview artwork for gallery cards. Mounting every live component on the landing page would eventually allocate unnecessary animation work or 3D renderers. The real interactive component mounts only in its detail page.

## Not yet implemented

The shadcn-compatible Registry, npm publishing, Three.js Stage/View runtime, and independent FrilAdd Rust CLI remain future work. They are not required for the current gallery/editor workflow.
