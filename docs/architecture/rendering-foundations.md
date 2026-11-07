# FrilCraft Rendering Foundations (RFC 0001)

**Status:** initial design agreement; **not an implementation**.

## Scope

Define a small, durable boundary for independent interactive components and a shared GPU renderer. Avoid designing a universal 3D engine before a real component requires one.

FrilCraft must support **Vanilla TypeScript directly** and **React through a thin adapter**. The source-copy distribution path must not require FrilStudio, the Playground, or shadcn.

## Decisions

### 1. Dependencies

- Native web APIs first: CSS, Web Animations API (WAAPI), Pointer Events, ResizeObserver, IntersectionObserver, and requestAnimationFrame.
- No required GSAP, Motion, or React Three Fiber (R3F).
- Three.js may be imported **only** by 3D components/backend entrypoints.
- React may be imported **only** by React adapter entrypoints; when packaged, it will be a peer dependency.
- Do not force a WebGL/WebGPU renderer on a DOM-only component.
- Test the **consumer bundle** rather than equating source imports with guaranteed bundle size.

### 2. Stage ownership

- A GPU **Stage** is explicitly created by the host application.
- A Stage owns **zero or one Canvas during initialization, exactly one while active**, and at most one Renderer.
- The same host element cannot have two active Stages. Use a host-keyed registry such as `WeakMap<HTMLElement, Stage>`; duplicate creation must fail with a useful error.
- Separate hosts may explicitly create independent Stages. One-Canvas is **per Stage**, not a global singleton.
- Disposal releases Stage-owned resources, event listeners, frame requests, and the host registry entry.
- React Providers must **not** silently create a nested Stage.

### 3. View-first registration

- A **View** represents one HTML element/viewport within an existing Stage, with stable identity and explicit registration/disposal.
- A View **never** creates a Canvas or Renderer.
- A View may use its own Scene and Camera, while the Stage's Renderer is shared.
- Backend-specific Scene initialization and replacement remain backend-specific; do not make an overgeneric Scene interface before the first renderer is working.
- Replacing a View's Scene must preserve the Stage Canvas and Renderer.
- DOM/CSS components work independently of Stage and View.

### 4. Multi-View rendering

- For the first Three.js backend, calculate visible View rectangles relative to the Stage canvas and render using viewport/scissor regions.
- Account for device pixel ratio, resizing, scroll position, clipping, pointer coordinates, and visibility.
- Document CSS limitations such as stacking contexts, overflow, transformed ancestors and transparent overlays; validate these in browser tests.
- Sharing a Renderer reduces context duplication; it does **not** eliminate the per-Scene GPU workload.
- Do not promise that distinct rendering backends can share one GPU context.

### 5. Animation, input and resources

- Use one frame scheduler per Stage, defaulting to **on-demand** invalidation; continuously update only the Views that actually need it.
- Route pointer events by the View's DOM bounds and input ownership, including pointer capture and touch considerations.
- Handle hidden/off-screen Views explicitly: pause updates, and apply a separate policy to GPU resource release.
- Distinguish owned from borrowed/shared geometries, materials and textures. A View disposal must not destroy resources used by another View.
- Surface renderer/context loss and fallback states rather than creating hidden replacement canvases.
- Native animations must respect `prefers-reduced-motion`; define keyboard and focus behavior for interactive controls.

### 6. React adapter

- React manages props and lifecycle, but it delegates rendering operations to the Vanilla runtime.
- Account for React StrictMode setup/cleanup cycles and rapid remounts.
- No additional Canvas from a React component or React Context consumer.
- Keep SSR-safe module imports; read `window` and `document` only during browser lifecycle.

### 7. Distribution and analytics

- Independent Vanilla and React entrypoints are the baseline. A component may also be available through optional source copy and optional shadcn Registry.
- No analytics code inside distributed components. Playground events are collected by the website only, if enabled and disclosed.
- Future npm `exports` must avoid importing Three.js into DOM-only or Vanilla-only consumers.
- Record any new runtime dependency with its exact beneficiary and measurable cost.

## Proposed directory boundaries

```text
packages/interactive/src/
  core/
    stage/          # ownership, scheduling and lifecycle
    view/           # view registration and bounds
  vanilla/          # framework-independent public API
  adapters/react/   # optional React facade
  backends/three/   # optional Three.js implementation
  components/dom/   # native effects
  components/three/ # 3D effect scene factories
```

These directories are boundaries, **not** a commitment to many npm packages.

## Initial acceptance tests (future implementation)

1. One Stage + 20 registered Views creates exactly one Canvas and one Renderer.
2. A second Stage on the same active host fails; separate hosts remain possible.
3. Swapping Scenes 100 times does not recreate Canvas/Renderer or leak listeners, timers, frame callbacks, or owned GPU resources.
4. An off-screen View stops unnecessary frame work; turning it back on restores output.
5. Two Views cannot accidentally free each other's shared resources.
6. React StrictMode remounts leave no duplicate registration, Canvas, or event handler.
7. Vanilla example does not install/import React; DOM-only consumer build does not include Three.js.
8. Vite and Next.js consumer builds work with explicit per-component imports.
9. Dispose and context-loss behavior is observable and testable.
10. Pointer events and hit-testing remain correct after scroll, resize and clipping.

## Deliberately deferred decisions

- The concrete backend Scene factory and camera interface.
- How much of direct WebGL2 / WebGPU to implement, based on real performance evidence.
- Whether to use one npm package with subpath exports or several packages at release time.
- Playground editor schema, source-code generation and shadcn Registry details.
- Open-source license selection before distributing the implementation.

**Next slice:** implement the Vanilla Stage registry and View lifecycle with tests; then add a minimal Three.js backend and a React adapter. Avoid releasing an API until the behavior is validated.
