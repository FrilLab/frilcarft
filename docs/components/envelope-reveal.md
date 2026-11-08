# Envelope Reveal

An accessible React envelope interaction that opens to reveal a customizable letter. The implementation uses React, CSS, and native button behavior. It has no animation-library, Canvas, Three.js, or Playground runtime dependency.

## Preview

Run `npm install` and `npm run dev` from the repository root, then open <http://localhost:5173>. The Playground provides text and color controls, live preview, usage-code generation, and a source-copy action.

## Package usage

The following workspace imports are available within this repository. The package is private and has not been published to npm.

```tsx
import { EnvelopeReveal } from "@frillab/interactive/envelope-reveal";
import "@frillab/interactive/envelope-reveal.css";

<EnvelopeReveal
  title="You're invited"
  message="A little something, just for you."
  eyebrow="A LETTER FOR YOU"
  envelopeColor="#d9bda7"
  accentColor="#966d78"
  paperColor="#fffdf8"
/>
```

The component accepts:

- `title`, `message`, and `eyebrow` for the letter content.
- `envelopeColor`, `accentColor`, and `paperColor` for its appearance.
- `initiallyOpen` for its initial state. Later clicks toggle the state.
- `onOpenChange(open)` when the user opens or closes the letter.
- `className` and `style` for the outer wrapper.

All props are optional. The defaults are: “You're invited”, “A little something, just for you.”, “A LETTER FOR YOU”, `#d9bda7`, `#966d78`, and `#fffdf8`.

## Accessibility and lifecycle

- A native `<button>` provides mouse, Enter, and Space activation.
- `aria-expanded`, `aria-controls`, and a changing accessible button label communicate the open state.
- The revealed content is exposed as a labeled region when open; decorative envelope layers are hidden from assistive technology.
- Text is rendered as React text, so user-provided strings are not interpreted as HTML.
- CSS transitions honor `prefers-reduced-motion` and the component remains fluid within its container.
- React owns the component DOM and listeners. StrictMode setup/cleanup leaves one rendered component, and unmount removes it without retained resources.

## Source copy

The Playground's **Component source** view reads the real component, barrel, CSS, and MIT license from the repository at build time. It copies all labeled files together with the React dependency and stylesheet instructions. This is the supported path for projects outside the workspace while the package remains unpublished.
