# Envelope Reveal

**Status:** working Vanilla prototype; React consumer integration and package publishing are not yet validated.

An accessible envelope that opens to reveal a letter. Vanilla TypeScript + CSS, with no runtime animation library or canvas. The optional React wrapper delegates to the same engine.

## Local preview

```bash
npm install
npm run build:demo:envelope
python3 -m http.server 4173
```

Open <http://localhost:4173/examples/vanilla/envelope-reveal/>.

## Vanilla

```ts
import { createEnvelopeReveal } from "./envelope-reveal.js";
import "./envelope-reveal.css";

const letter = createEnvelopeReveal(document.getElementById("envelope")!, {
  title: "You're invited",
  envelopeColor: "#d9bda7",
});
letter.setOpen(true);
letter.setOptions({ title: "Save the date" });
letter.dispose();
```

Copy the source and CSS into your application. The package is private and **not yet available from npm**.

## Optional React

The wrapper source is at `packages/interactive/src/adapters/react/EnvelopeReveal.tsx`. The host component imports the CSS explicitly.

```tsx
import { EnvelopeReveal } from "./EnvelopeReveal";
import "./envelope-reveal.css";

<EnvelopeReveal
  title="You're invited"
  message="Join us for something special."
  accentColor="#966d78"
/>
```

React is required only for the optional wrapper; the Vanilla component does not import it. The wrapper uses uncontrolled open/close state: `initiallyOpen` is only an initial value.

## API and accessibility

- `createEnvelopeReveal(host, options)`: create an independent instance.
- `setOpen(boolean)`, `toggle()`, `isOpen`: control and inspect state.
- `setOptions(partialOptions)`: update text, colors and change callback.
- `dispose()`: remove owned DOM and listeners.
- Options: title, message, eyebrow, envelopeColor, accentColor, paperColor, initiallyOpen and onOpenChange.
- Uses a native button with ARIA expanded state, keyboard interaction, a readable letter region, and reduced-motion support.
- Text is applied using textContent, never raw HTML.
- No Canvas or renderer is allocated.

## Release blockers

This is an experiment, not a published release. Add React consumer tests and packaging/exports before publishing. The source is licensed under MIT (see the root LICENSE).
