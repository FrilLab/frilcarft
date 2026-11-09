import { EnvelopeReveal } from "@frillab/interactive/envelope-reveal";
import type { EnvelopeRevealProps } from "@frillab/interactive/envelope-reveal";
import componentSource from "../../../../../packages/interactive/src/components/envelope-reveal/EnvelopeReveal.tsx?raw";
import componentIndexSource from "../../../../../packages/interactive/src/components/envelope-reveal/index.ts?raw";
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
  sourceImportPath: "./components/envelope-reveal",
  Preview: EnvelopeReveal,
  defaultProps: envelopeRevealDefaults,
  controls: [
    { key: "title", label: "Title", description: "The main line printed on the revealed letter.", kind: "text" },
    { key: "message", label: "Message", description: "The letter copy shown beneath its title.", kind: "textarea" },
    { key: "eyebrow", label: "Eyebrow text", description: "The small introductory line above the title.", kind: "text" },
    { key: "envelopeColor", label: "Envelope color", description: "The base color used for the envelope and pocket.", kind: "color" },
    { key: "accentColor", label: "Accent color", description: "The accent used on the flap and wax seal.", kind: "color" },
    { key: "paperColor", label: "Paper color", description: "The background color of the letter.", kind: "color" },
  ],
  sourceFiles: [
    { path: "EnvelopeReveal.tsx", content: componentSource },
    { path: "index.ts", content: componentIndexSource },
    { path: "LICENSE", content: licenseText },
  ],
  sourceInstructions: "Copy all files into src/components/envelope-reveal/. This example assumes it is in src/App.tsx. Install React 19, cn, and Tailwind CSS v4 with @tailwindcss/vite; FrilAdd copies files but does not install dependencies or configure Tailwind.",
  previewHint: "Click the envelope to open it",
  previewFeatures: ["React 19", "Reduced motion supported"],
});
