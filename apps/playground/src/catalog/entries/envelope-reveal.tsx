import { EnvelopeReveal } from "@frillab/interactive/envelope-reveal";
import "@frillab/interactive/envelope-reveal.css";
import type { EnvelopeRevealProps } from "@frillab/interactive/envelope-reveal";
import componentSource from "../../../../../packages/interactive/src/components/envelope-reveal/EnvelopeReveal.tsx?raw";
import componentIndexSource from "../../../../../packages/interactive/src/components/envelope-reveal/index.ts?raw";
import componentStyles from "../../../../../packages/interactive/src/components/envelope-reveal/envelope-reveal.css?sourceText";
import licenseText from "../../../../../LICENSE?raw";
import { registerComponent } from "../codegen.js";

type EnvelopeRevealPlaygroundProps = Pick<
  Required<EnvelopeRevealProps>,
  "title" | "message" | "eyebrow" | "envelopeColor" | "accentColor" | "paperColor"
>;

const envelopeRevealDefaults: EnvelopeRevealPlaygroundProps = {
  title: "You're invited",
  message: "A little something, just for you.",
  eyebrow: "A LETTER FOR YOU",
  envelopeColor: "#d9bda7",
  accentColor: "#966d78",
  paperColor: "#fffdf8",
};

export const componentDetail = registerComponent<EnvelopeRevealPlaygroundProps>({
  componentName: "EnvelopeReveal",
  workspaceImportPath: "@frillab/interactive/envelope-reveal",
  workspaceCssImportPath: "@frillab/interactive/envelope-reveal.css",
  sourceImportPath: "./components/envelope-reveal",
  sourceCssImportPath: "./components/envelope-reveal/envelope-reveal.css",
  Preview: EnvelopeReveal,
  defaultProps: envelopeRevealDefaults,
  controls: [
    { key: "title", label: "Title", kind: "text" },
    { key: "message", label: "Message", kind: "textarea" },
    { key: "eyebrow", label: "Eyebrow text", kind: "text" },
    { key: "envelopeColor", label: "Envelope color", kind: "color" },
    { key: "accentColor", label: "Accent color", kind: "color" },
    { key: "paperColor", label: "Paper color", kind: "color" },
  ],
  sourceFiles: [
    { path: "EnvelopeReveal.tsx", content: componentSource },
    { path: "index.ts", content: componentIndexSource },
    { path: "envelope-reveal.css", content: componentStyles },
    { path: "LICENSE", content: licenseText },
  ],
  sourceInstructions: "Copy all files into src/components/envelope-reveal/. This usage example assumes it is in src/App.tsx. React 18 or 19 is required; no other runtime dependency is needed.",
  previewHint: "Click the envelope to open it",
  previewFeatures: ["Keyboard accessible", "Reduced motion supported"],
});
