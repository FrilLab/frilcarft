# FrilCraft

**Craft interactive experiences for the web.**

FrilCraft is an early prototype for reusable React components. Envelope Reveal is the first complete workflow: a React + TypeScript component, a Vite Playground preview, editable properties, generated usage examples, and individual source-file copying. The `@frillab/interactive` package is private and unpublished. For projects outside this workspace, use the copied-source workflow.

## Repository structure

```text
apps/playground/                  React + TypeScript Playground
packages/interactive/             Reusable React components and package build
tests/consumers/react-vite/       Built-package React consumer validation
tests/consumers/source-vite/      Isolated copied-source consumer validation
scripts/                          Registry sync and verification
docs/                             Architecture and contributor documentation
```

The Playground Gallery imports only static catalog metadata. It provides name, ID, description, category, and tag search; category and multi-tag filters can be shared through URL query parameters. Component entries, component CSS, and copyable raw source files load only when a user opens a detail route. The detail preview imports the actual reusable component from `packages/interactive`.

## How the project connects

The package is the source of truth for components; the Playground is a separate application that imports them. The catalog is a list of registered components, not another implementation.

```text
Browser
  |
  v
Playground App
  |
  +-- Gallery -------------------- Lightweight catalog metadata
  |
  +-- Component Detail
        |
        +-- Lazy-loaded component entry
                +-- Reusable package component
                +-- Property controls and usage-code generator
                +-- Actual source files and FrilAdd commands
```

Component implementations live in `packages/interactive/src/components/`. Gallery metadata lives in `apps/playground/src/catalog/index.ts`; each component's implementation imports and detail configuration live under `apps/playground/src/catalog/entries/`. Category IDs, category labels, and the curated semantic tag vocabulary live in `apps/playground/src/catalog/metadata.ts`. Shared filtering and URL query parsing live in `apps/playground/src/catalog/filter.ts`; shared usage-code serialization lives in `apps/playground/src/catalog/codegen.ts`.

Gallery metadata separates three concepts: a **Category** is one primary classification used for navigation, a **Tag** is a curated semantic filter that can be combined with other tags, and **Badges** are noninteractive technology labels such as React and CSS. New metadata and lazy detail registrations appear in the Gallery and its filters automatically; shared page components do not need component-specific edits. See [Adding components](docs/adding-components.md) for how to choose an existing category and tag or extend the curated tag list.

The Playground has two entry points:

- `/` lists **all registered components** as static preview cards and supports shareable search and filters.
- `/components/envelope-reveal` opens Envelope Reveal's interactive detail view directly.

Adding metadata and a lazy detail entry adds the card and URL. The gallery uses static preview artwork rather than running every component. See [Project Map](docs/architecture/project-map.md) and [Adding components](docs/adding-components.md).

## Requirements and development

- Node.js `^22.22.2`, `^24.15.0`, or `>=26.0.0` (required by JSDOM 31)
- npm 10 or newer

```bash
npm ci
npm run typecheck
npm run test
npm run registry:sync
npm run test:registry
npm run build
npm run dev
npm run preview
```

- `dev` starts the Playground at <http://localhost:5173> with Vite HMR.
- `typecheck` checks package, Playground, consumer, and test TypeScript.
- `test` runs focused component, Playground, and usage-generator tests.
- `build` builds the library, Playground, built-package consumer, and isolated source consumer.
- `build:playground` checks the production bundle manifest to confirm component code and raw source stay outside the initial Gallery bundle.
- `registry:sync` updates only changed Registry SHA-256 values from canonical source bytes. Run `npm run test:registry` separately to verify; verification never writes files.
- `preview` serves the production Playground at <http://localhost:4173>; run `npm run build` first.

TypeScript 7 provides the `tsc` CLI. The `typescript-api` npm alias keeps the TypeScript 6 compiler API available to the Registry catalog parser and generated-usage tests until TypeScript 7 ships its stable API.

## Install Envelope Reveal outside this workspace

[FrilAdd](https://www.npmjs.com/package/friladd) is the recommended developer-side installer. Commands use npm's `latest` dist-tag. Register FrilCraft once for your global setup:

```bash
npx --yes friladd@latest registry add frilcraft https://raw.githubusercontent.com/FrilLab/frilcraft/main/registry.json --global --default
```

This makes the Registry available across projects and selects FrilCraft as your default; `--default` can replace an existing default Registry selection. Omit it to keep the current default. Then run this from your project directory:

```bash
npx --yes friladd@latest add envelope-reveal
```

If you registered the alias without making it the default, use the explicit alias instead:

```bash
npx --yes friladd@latest add frilcraft/envelope-reveal
```

FrilAdd copies the selected component's declared files into your project. Use them from `src/App.tsx`:

```tsx
import { EnvelopeReveal } from "./components/envelope-reveal";
import "./components/envelope-reveal/envelope-reveal.css";

export function Invitation() {
  return (
    <EnvelopeReveal
      title="You're invited"
      message="Join us for something special."
      eyebrow="A LETTER FOR YOU"
      envelopeColor="#d9bda7"
      accentColor="#966d78"
      paperColor="#fffdf8"
    />
  );
}
```

The component requires React 18 or 19 and has no other runtime dependency. Keep the included MIT license notice with copies and redistributions. The Playground also shows **Workspace Usage** for examples inside this repository; those imports rely on the private package and are not an external installation path. **Source Files** remain available for inspection and manual copying.

See [FrilAdd installation options](docs/friladd-integration.md) for project-local registration, the one-time explicit URL command, existing-file behavior, and reproducible Registry URLs. The [Registry Manifest](registry.json) follows FrilAdd's generic v1 format; FrilAdd has no FrilCraft-specific logic. See [Envelope Reveal](docs/components/envelope-reveal.md) for the API and [Adding components](docs/adding-components.md) for the contributor workflow.

The independent distribution flow is:

```text
packages/interactive -> registry.json -> FrilAdd CLI -> Consumer React Project
```

After changing Registry source files, run `npm run registry:sync` and then `npm run test:registry`. CI runs the read-only verification and fails on stale hashes.

## Architecture

React is the primary component interface. CSS and browser APIs handle DOM-only interactions. Stage/View rendering contracts remain documented for future GPU components; no Three.js runtime is implemented. See [Rendering Foundations](docs/architecture/rendering-foundations.md).

## License

FrilCraft is licensed under the [MIT License](LICENSE). Copyright (c) 2026 FrilLab. Copies and substantial portions must retain the copyright and permission notice.
