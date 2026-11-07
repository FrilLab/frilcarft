# Envelope Reveal — standalone example

This demo runs on a static HTTP server. It does **not** use React, Three.js, GSAP, or Motion.

From the repository root:

```bash
npm install
npm run build:demo:envelope
python3 -m http.server 4173
```

Open <http://localhost:4173/examples/vanilla/envelope-reveal/>.

The generated JavaScript is compiled from the TypeScript source in `packages/interactive/src/components/dom/envelope-reveal/`. Run the build script before starting the demo; do not edit the generated output by hand.
