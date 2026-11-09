# Envelope Reveal

An accessible React envelope interaction that opens to reveal a customizable letter. The component is one TSX file styled with Tailwind CSS v4 utilities and CSS custom properties. It uses `cn` to merge consumer classes. It has no separate component stylesheet, animation library, Canvas, Three.js, R3F, Drei, or Playground runtime dependency.

## Preview

Run `npm ci` and `npm run dev` from the repository root, then open <http://localhost:5173>. The Playground imports the package component for its preview, lets you edit text and colors, and resets values to the component defaults.

## Use outside this workspace

The `@frillab/interactive` package is private and has not been published to npm. In the Playground, open **Source Files** and copy these files into `src/components/envelope-reveal/` in your React project:

```text
src/components/envelope-reveal/
  EnvelopeReveal.tsx
  index.ts
  LICENSE
```

The component requires React 19, the `cn` runtime dependency, and Tailwind CSS v4 in your build. FrilAdd copies source files only; it does not install dependencies or configure Tailwind.

The Playground's shadcn/ui and Radix controls are not imported by Envelope Reveal or included in its copied source. External consumers do not need those Playground dependencies.

Install its component and build dependencies:

```bash
npm install cn
npm install -D tailwindcss @tailwindcss/vite
```

Add the official Tailwind Vite plugin:

```ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({ plugins: [tailwindcss()] });
```

Create or update your application stylesheet. If it is `src/app.css`, the `@source` path below includes the copied component's static utility classes:

```css
@import "tailwindcss";
@source "./components/envelope-reveal";
```

Import the CSS entry from your React application entry and use the local source:

```tsx
import "./app.css";
import { EnvelopeReveal } from "./components/envelope-reveal";

export function Invitation() {
  return (
    <EnvelopeReveal
      title="You're invited"
      message="A little something, just for you."
      eyebrow="A LETTER FOR YOU"
      envelopeColor="#d9bda7"
      accentColor="#966d78"
      paperColor="#fffdf8"
    />
  );
}
```

There is no stylesheet import from the component folder. Keep the included `LICENSE` file and its copyright and permission notice with redistributed copies.

## Workspace package usage

The package import below works only in this repository's npm workspace. It is not an npm installation instruction for external projects. The Playground's global Tailwind stylesheet scans the package source.

```tsx
import { EnvelopeReveal } from "@frillab/interactive/envelope-reveal";

<EnvelopeReveal title="You're invited" />
```

## Properties

All properties are optional:

- `title`, `message`, and `eyebrow` set the letter content.
- `envelopeColor`, `accentColor`, and `paperColor` set its appearance through CSS custom properties; colors are not dynamic Tailwind class names.
- `initiallyOpen` sets the starting state. Later button activations toggle the state.
- `onOpenChange(open)` runs for each open or close activation.
- `className` uses `cn` to merge consumer utility classes with component defaults.
- `style` applies inline styles to the outer wrapper.

Defaults are “You're invited”, “A little something, just for you.”, “A LETTER FOR YOU”, `#d9bda7`, `#966d78`, and `#fffdf8`. The Playground exposes the text and color properties as editable controls; the usage generator omits properties that match those defaults.

## Accessibility and lifecycle

- A native `<button>` supports mouse, Enter, and Space activation.
- `aria-expanded`, `aria-controls`, and a changing accessible button label communicate the state.
- The revealed content is exposed as a labeled region when open; decorative envelope layers are hidden from assistive technology.
- Text is rendered as React text and is not interpreted as HTML.
- Tailwind reduced-motion variants remove transitions and restore normal `will-change` behavior when the user's system requests reduced motion.
- StrictMode remounts render one component, and React owns and removes its DOM on unmount.

## Source files and updates

The Playground reads `EnvelopeReveal.tsx`, `index.ts`, and the root MIT license from their canonical repository paths. It displays and copies each file individually. The Registry Manifest v1 lists these files without a component stylesheet. Existing FrilAdd-installed copies are not upgraded automatically; manual replacement may be needed when moving to this source layout.

The isolated source consumer typechecks the copied files and builds Tailwind CSS from them without importing `@frillab/interactive`.
