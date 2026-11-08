# FrilCraft

**Craft interactive experiences for the web.**

FrilCraft is an early prototype for reusable interactive React components. The first complete workflow uses Envelope Reveal in a Vite Playground: edit its properties, preview the library component, and copy React usage or the component source. The `@frillab/interactive` workspace package is private and is not published to npm.

## Repository structure

```text
apps/playground/           React + TypeScript Playground
packages/interactive/      Reusable React components and package build
tests/consumers/            Independent React consumer build
docs/                       Architecture and contributor documentation
registry/                   Reserved; no Registry is implemented
```

Envelope Reveal lives in `packages/interactive/src/components/envelope-reveal/`. The Playground imports the package workspace entry; Vite resolves its development condition to the component source for HMR. Production builds use the package's built export. The Playground imports the exported stylesheet separately.

## Requirements

- Node.js 22.12 or newer
- npm 10 or newer

## Development commands

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run test
npm run preview
```

- `dev` starts the Playground with Vite HMR at <http://localhost:5173>.
- `build` builds the reusable package, Playground, and independent consumer fixture.
- `typecheck` checks maintained package, Playground, consumer, and test TypeScript without emitting files.
- `test` runs the focused React component and Playground tests with Vitest.
- `preview` serves the built Playground at <http://localhost:4173>; run `npm run build` first.

## Using Envelope Reveal

```tsx
import { EnvelopeReveal } from "@frillab/interactive/envelope-reveal";
import "@frillab/interactive/envelope-reveal.css";

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

The import above works inside this npm workspace. The package is private and unpublished, so external projects can use the Playground's **Component source** copy workflow instead. See [Envelope Reveal](docs/components/envelope-reveal.md) for the current API and [Adding components](docs/adding-components.md) for the implemented catalog workflow.

## Architecture

React is the primary component interface. CSS and browser APIs handle DOM-only interactions. The Stage/View rendering contracts remain documented for future GPU components, but no Three.js runtime is implemented. See [Rendering Foundations](docs/architecture/rendering-foundations.md).

## License

FrilCraft is licensed under the [MIT License](LICENSE). Copyright (c) 2026 FrilLab. You may use, modify, and redistribute the code, including in commercial projects, subject to the license's copyright and permission notice requirements.
