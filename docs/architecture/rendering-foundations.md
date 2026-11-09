# FrilCraft Rendering Foundations (RFC 0001)

**Status:** design contract for future GPU components; not a runtime implementation.

## Scope

FrilCraft's initial public component interface is React 19 + TypeScript. Tailwind CSS v4 styles DOM components, and browser APIs handle their interactions. These rendering foundations preserve a clear path for future GPU-backed components without making DOM components depend on a renderer.

The Playground uses local shadcn/ui source backed by Radix for its own controls. Those modules are an application concern and are excluded from the reusable package and source distribution contract.

## Component and dependency boundaries

- React is a peer dependency of the reusable component package. `cn` is a runtime dependency when a component imports it. The Playground and build tools remain development tooling.
- Prefer Tailwind utilities and native browser APIs for DOM interaction and animation. Motion and GSAP are not dependencies. React Three Fiber is the preferred React integration only for a future component that genuinely needs 3D.
- Three.js may be used only by components or backend entrypoints that need 3D.
- Tailwind styles HTML overlays; it does not style Three.js mesh materials.
- DOM-only components must not import Three.js, allocate Canvas elements, or require a Stage or View.
- Keep package subpath exports explicit so a DOM consumer does not load unrelated GPU code.
- Components and copied source must not depend on the Playground, Registry, FrilStudio, analytics, or remote services.

## Stage ownership

- A GPU Stage is explicitly created by its host application.
- A Stage owns at most one Canvas and at most one Renderer; while active, the implementation should own exactly one Canvas.
- The same host element cannot have two active Stages. Duplicate creation must fail with a useful error.
- Separate hosts may explicitly own separate Stages. One-Canvas ownership is per Stage, not global.
- Disposal releases Stage-owned resources, event listeners, frame requests, and the host registry entry.
- React components must not silently create nested Stages.

## View registration

- A View represents an HTML element or viewport registered with an existing Stage.
- A View never creates a Canvas or Renderer.
- A View may use its own Scene and Camera while sharing its Stage's Renderer.
- Replacing a View's Scene must preserve the Stage Canvas and Renderer.
- Backend-specific Scene initialization and replacement remain backend-specific until a working renderer needs those contracts.

## Multi-View rendering

- A future Three.js backend should render visible View rectangles relative to the Stage Canvas with viewport/scissor regions.
- Account for device pixel ratio, resizing, scroll position, clipping, pointer coordinates, and visibility.
- Document CSS limitations such as stacking contexts, overflow, transformed ancestors, and transparent overlays; validate them in browser tests.
- A shared Renderer reduces context duplication but does not eliminate per-Scene GPU work.
- Do not promise that distinct rendering backends can share one GPU context.

## Animation, input, and resources

- Use one frame scheduler per Stage, defaulting to on-demand invalidation; continuously update only Views that need it.
- Route pointer events by View bounds and input ownership, including pointer capture and touch.
- Handle hidden/off-screen Views explicitly and define GPU resource release separately from update pausing.
- Distinguish owned from borrowed/shared geometries, materials, and textures. A View must not dispose resources still used elsewhere.
- Surface renderer/context loss rather than creating hidden replacement canvases.
- Interactive components must define keyboard/focus behavior and respect `prefers-reduced-motion`.

## React lifecycle

- React owns React component markup and lifecycle.
- Any future React Stage integration must account for StrictMode setup/cleanup cycles and rapid remounts.
- A component must not allocate an extra Canvas or renderer as a side effect of rendering.
- Keep browser globals out of module initialization so server-side imports remain safe.

## Distribution

- The current package exports the React Envelope Reveal component through an explicit subpath. It has no separate component stylesheet; consumers compile its static Tailwind utilities from component source.
- React remains a peer dependency and `cn` a component runtime dependency. Three.js, R3F, and Drei are not installed until a component uses them.
- Test independent consumer builds; source imports or subpath exports alone do not prove bundle boundaries.
- Preserve the MIT license notice in copied component source.

## Deferred work

- Stage/View runtime implementation and the first functioning Three.js backend.
- Direct WebGL2/WebGPU backend decisions based on a real component and performance evidence.
- GPU resource sharing, context loss, visibility, and pointer-routing policies.
- Public npm publishing and a 3D runtime implementation.

The Stage and View interfaces currently in `packages/interactive/src/core/` are type-only design contracts, not implemented APIs. Do not describe them as working runtime features.
