# FrilCraft

**Craft interactive experiences for the web.**

FrilCraft is an early prototype for reusable React components. Envelope Reveal is the first complete workflow: a React + TypeScript component, a Vite Playground preview, editable properties, generated usage examples, and individual source-file copying. The `@frillab/interactive` package is private and unpublished. For projects outside this workspace, use the copied-source workflow.

## Repository structure

```text
apps/playground/                  React + TypeScript Playground
packages/interactive/             Reusable React components and package build
tests/consumers/react-vite/       Built-package React consumer validation
tests/consumers/source-vite/      Isolated copied-source consumer validation
docs/                             Architecture and contributor documentation
```

The Playground preview imports the actual component from `packages/interactive`. Vite uses the package's development export for HMR and its built export in production. The component stylesheet is imported separately.

## How the project connects

The package is the source of truth for components; the Playground is a separate application that imports them. The catalog is a list of registered components, not another implementation.

```text
packages/interactive/src/components/envelope-reveal/
    └── EnvelopeReveal.tsx + CSS        reusable implementation
                    ↓
apps/playground/src/catalog.tsx          registration and display metadata
                    ↓
apps/playground/src/ComponentGallery.tsx /       component gallery
apps/playground/src/ComponentDetail.tsx          live editor and source copying
                    ↓
tests/consumers/                       verify real external usage
```

The Playground has two entry points:

- `/` lists **all registered components** as cards.
- `/components/envelope-reveal` opens Envelope Reveal's interactive detail view directly.

Registering another component in the catalog automatically adds its card and detail URL. The gallery uses static preview artwork rather than running every component (important for future GPU components). See [Project Map](docs/architecture/project-map.md) and [Adding components](docs/adding-components.md).

## Requirements and development

- Node.js 22.12 or newer
- npm 10 or newer

```bash
npm ci
npm run dev
npm run typecheck
npm run test
npm run build
npm run preview
```

- `dev` starts the Playground at <http://localhost:5173> with Vite HMR.
- `typecheck` checks package, Playground, consumer, and test TypeScript.
- `test` runs focused component, Playground, and usage-generator tests.
- `build` builds the library, Playground, built-package consumer, and isolated source consumer.
- `preview` serves the production Playground at <http://localhost:4173>; run `npm run build` first.

## Use Envelope Reveal outside this workspace

Copy the four files from the Playground's **Source Files** view into `src/components/envelope-reveal/`:

```text
src/components/envelope-reveal/
  EnvelopeReveal.tsx
  index.ts
  envelope-reveal.css
  LICENSE
```

Then use the local source path from `src/App.tsx`:

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

The component requires React 18 or 19 and has no other runtime dependency. Keep the included MIT license notice with copies and redistributions. The Playground also shows **Workspace Usage** for examples inside this repository; those imports rely on the private package and are not an external installation path.

See [Envelope Reveal](docs/components/envelope-reveal.md) for the API and [Adding components](docs/adding-components.md) for the implemented contribution workflow.

## FrilAdd source installation

FrilCraft publishes a [FrilAdd Registry v1 manifest](registry.json) for independently installing Envelope Reveal's source, stylesheet, barrel file, and MIT notice. [Integration instructions](docs/friladd-integration.md) include the local Rust CLI workflow and SHA-256 validation. FrilAdd's npm distribution is not assumed available yet.

## Architecture

React is the primary component interface. CSS and browser APIs handle DOM-only interactions. Stage/View rendering contracts remain documented for future GPU components; no Three.js runtime is implemented. See [Rendering Foundations](docs/architecture/rendering-foundations.md).

## License

FrilCraft is licensed under the [MIT License](LICENSE). Copyright (c) 2026 FrilLab. Copies and substantial portions must retain the copyright and permission notice.
