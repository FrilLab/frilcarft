# FrilCraft contributor rules

This repository is an **early prototype**, not a published component library. The Envelope Reveal experiment is implemented, but the architecture and consumer packaging remain under validation.

## Documentation and communication

- Write all public documentation, README files, code comments, API references, examples, issue descriptions, pull-request descriptions, and release notes in **English**.
- Keep technical terminology and exported symbol names consistent across documentation, Vanilla APIs, and React adapters.
- Update the relevant documentation in the same change as a public API or architecture change.
- Do not describe planned behavior as implemented, or imply that an unreleased package is available.

## Dependency boundaries

- Implement reusable behavior in **Vanilla TypeScript** using built-in browser APIs first.
- React is an **optional adapter**. Vanilla consumers must not need React.
- Three.js is an **optional 3D backend**. DOM-only components must never import it.
- Do not add Motion, GSAP, R3F, or other runtime libraries without a benchmark and an explicit architecture decision.
- Keep the shadcn Registry optional; never make component functionality depend on the Playground, Registry, FrilStudio, analytics, or a remote service.

## Rendering ownership

- A Stage may own **at most one Canvas and one Renderer**.
- Only explicit Stage creation may allocate a GPU Canvas; a View or Scene must not allocate one.
- Register multiple Views within a Stage; changing a Scene must not recreate the Canvas or Renderer.
- Creating another Stage for the same host should fail clearly. Explicit separate hosts may use separate Stages.
- Frame scheduling, event routing, and GPU resource disposal belong to the Stage/runtime layer.
- Never dispose shared GPU resources while another View still uses them.
- DOM-only components need no Stage.

## API and lifecycle

- Vanilla is the source of truth; React delegates lifecycle to Vanilla and must behave under StrictMode remounts.
- Keep `core` independent of React and Three.js types.
- Do not promise that Three.js Scenes can automatically run on a direct WebGPU backend.
- Do not publish dummy methods that pretend a feature exists. Type-only contracts are marked as such.

## Definition of done for future features

- Implement the **complete** feature and its public API, docs, cleanup, and tests in the tracked issue/PR; do not mark it complete when follow-up implementation remains.
- Verify multi-View single-Canvas behavior, duplicate host rejection, mount/unmount cleanup, independent Vanilla consumption, and React consumer compatibility where relevant.
- Measure bundle inclusion with real consumer builds. A subpath export alone is not proof of tree shaking.
- Distributed components must not contain hidden analytics or tracking calls.

See [rendering foundations](docs/architecture/rendering-foundations.md) before modifying runtime boundaries.
