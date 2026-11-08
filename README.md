# FrilCraft

**Craft interactive experiences for the web.**

FrilCraft is an open-source project for building reusable, independently usable interactive web components. Its goal is to turn interaction patterns developed and validated in FrilStudio into components that can be adopted in other projects.

> **Status: early prototype (not released).** The repository includes an architecture scaffold and a working Vanilla Envelope Reveal experiment. The optional React adapter still needs consumer validation. No published npm package, hosted Playground, or shadcn Registry is available yet.

## Design principles

- **Vanilla-first:** Implement framework-independent behavior in Vanilla TypeScript using native browser APIs.
- **React optional:** Provide React APIs as adapters over the Vanilla runtime. Vanilla consumers must not need React.
- **Native Web APIs first:** Prefer CSS, the Web Animations API (WAAPI), Pointer Events, ResizeObserver, IntersectionObserver, and `requestAnimationFrame`. Motion, GSAP, and React Three Fiber (R3F) are not default dependencies.
- **Three.js only when needed:** Use Three.js selectively for 3D components. DOM-only effects must not pull it into their dependency graph.
- **Stage owns rendering:** A Stage owns at most one Canvas and one Renderer. Views and Scenes must never allocate their own Canvas.
- **View-first:** A View maps an HTML element to a rendering region managed by its Stage. Replacing a Scene must not recreate the Canvas.
- **Independent distribution:** Prioritize individually usable components, source copying, and separate Vanilla/React entrypoints. A shadcn-compatible Registry will be an optional distribution method.
- **No hidden telemetry:** Distributed components must not include usage tracking or hidden calls to FrilCraft servers.

## Repository structure

```text
apps/
  playground/              # Future gallery, visual controls, and code generation
packages/
  interactive/
    src/
      core/
        stage/              # Stage ownership and lifecycle contracts
        view/               # View registration and bounds contracts
      vanilla/              # Framework-independent entrypoint (planned)
      adapters/react/       # React adapter (planned)
      backends/three/       # Optional Three.js backend (planned)
      components/dom/       # Native DOM interactions (planned)
      components/three/     # Three.js scenes (planned)
registry/                   # Optional shadcn Registry (planned)
examples/
  vanilla/
  react/
tests/
  consumers/                # Standalone consumer-app tests (planned)
docs/
  architecture/
```

Git does not track empty directories, so some locations contain only `.gitkeep` placeholders. The presence of a directory does **not** mean its feature has been implemented.

## First experiment

- [Envelope Reveal component](docs/components/envelope-reveal.md)
- [Standalone Vanilla demo](examples/vanilla/envelope-reveal/)
- [Video recording plan](docs/content/001-envelope-reveal.md)

The demo uses native TypeScript and CSS without Canvas, Three.js, Motion, or GSAP.

## Development

```bash
npm install
npm run typecheck
npm run build:demo:envelope
```

At this stage, `typecheck` performs static checks on the initial TypeScript contracts only. Runtime and browser tests, along with build and publishing pipelines, will be added during implementation.

## Planned implementation order

1. Implement and test Stage/View ownership rules and the Vanilla lifecycle.
2. Validate a Three.js backend that renders multiple Views through one Canvas.
3. Add a React adapter that consumes the same Vanilla runtime.
4. Build the first standalone component and Playground, then introduce optional Registry distribution.

See [Rendering Foundations](docs/architecture/rendering-foundations.md) for design decisions and pre-implementation acceptance criteria.

## Documentation language

Public documentation, code comments, API references, issues, and pull-request descriptions are written in **English** to keep the project accessible to international contributors.

## License

FrilCraft is licensed under the [MIT License](LICENSE). Copyright (c) 2026 FrilLab. You may use, modify, and redistribute the code, including in commercial projects, subject to the license's copyright and permission notice requirements.
