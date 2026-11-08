# Envelope Reveal

An accessible React envelope interaction that opens to reveal a customizable letter. It uses React, CSS, and native button behavior. It has no animation-library, Canvas, Three.js, or Playground runtime dependency.

## Preview

Run `npm ci` and `npm run dev` from the repository root, then open <http://localhost:5173>. The Playground imports the package component for its preview, lets you edit text and colors, and resets values to the component defaults.

## Use outside this workspace

The package is private and has not been published to npm. In the Playground, open **Source Files** and copy each file into `src/components/envelope-reveal/` in your React project:

```text
src/components/envelope-reveal/
  EnvelopeReveal.tsx
  index.ts
  envelope-reveal.css
  LICENSE
```

From `src/App.tsx`, use the copied component and stylesheet:

```tsx
import { EnvelopeReveal } from "./components/envelope-reveal";
import "./components/envelope-reveal/envelope-reveal.css";

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

React 18 or 19 is required. There are no other runtime dependencies. Keep the included `LICENSE` file and its copyright and permission notice with redistributed copies.

## Workspace package usage

The package imports below work only in this repository's npm workspace. They are not npm installation instructions for external projects.

```tsx
import { EnvelopeReveal } from "@frillab/interactive/envelope-reveal";
import "@frillab/interactive/envelope-reveal.css";

<EnvelopeReveal title="You're invited" />
```

## Properties

All properties are optional:

- `title`, `message`, and `eyebrow` set the letter content.
- `envelopeColor`, `accentColor`, and `paperColor` set its appearance.
- `initiallyOpen` sets the starting state. Later button activations toggle the state.
- `onOpenChange(open)` runs when the user opens or closes the letter.
- `className` and `style` apply to the outer wrapper.

Defaults are “You're invited”, “A little something, just for you.”, “A LETTER FOR YOU”, `#d9bda7`, `#966d78`, and `#fffdf8`. The Playground exposes the text and color properties as editable controls; the usage generator omits properties that match those defaults.

## Accessibility and lifecycle

- A native `<button>` supports mouse, Enter, and Space activation.
- `aria-expanded`, `aria-controls`, and a changing accessible button label communicate the state.
- The revealed content is exposed as a labeled region when open; decorative envelope layers are hidden from assistive technology.
- Text is rendered as React text and is not interpreted as HTML.
- CSS transitions honor `prefers-reduced-motion`; the component fits its container.
- StrictMode remounts render one component, and React owns and removes its DOM on unmount.

## Source files

The Playground reads `EnvelopeReveal.tsx`, `index.ts`, the stylesheet, and the root MIT license from their real repository paths at build time. It displays and copies each file individually. The isolated source consumer build validates these files without importing `@frillab/interactive`.
