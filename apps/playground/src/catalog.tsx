import { createElement } from "react";
import type { ComponentType, ReactNode } from "react";
import { EnvelopeReveal } from "@frillab/interactive/envelope-reveal";
import type { EnvelopeRevealProps } from "@frillab/interactive/envelope-reveal";
import componentSource from "../../../packages/interactive/src/components/envelope-reveal/EnvelopeReveal.tsx?raw";
import componentIndexSource from "../../../packages/interactive/src/components/envelope-reveal/index.ts?raw";
import componentStyles from "../../../packages/interactive/src/components/envelope-reveal/envelope-reveal.css?sourceText";
import licenseText from "../../../LICENSE?raw";

type StringProps = Record<string, string>;

export type ControlKind = "text" | "textarea" | "color";

export interface PlaygroundControl<Props extends StringProps = StringProps> {
  readonly key: keyof Props;
  readonly label: string;
  readonly kind: ControlKind;
}

interface ComponentDefinition<Props extends StringProps> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly importPath: string;
  readonly cssImportPath: string;
  readonly Preview: ComponentType<Props>;
  readonly defaultProps: Props;
  readonly controls: readonly PlaygroundControl<Props>[];
  readonly sourceText: string;
}

export interface ComponentRegistration {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly defaultProps: StringProps;
  readonly controls: readonly PlaygroundControl[];
  readonly render: (props: StringProps) => ReactNode;
  readonly generateUsageCode: (props: StringProps) => string;
  readonly sourceText: string;
}

export function serializeString(value: string): string {
  return JSON.stringify(value)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function createUsageCode<Props extends StringProps>(
  definition: Pick<ComponentDefinition<Props>, "importPath" | "cssImportPath" | "defaultProps" | "controls">,
  props: Props,
): string {
  const changedProps = definition.controls
    .filter(({ key }) => props[key] !== definition.defaultProps[key])
    .map(({ key }) => `      ${String(key)}={${serializeString(props[key])}}`);

  const component = changedProps.length === 0
    ? "    <EnvelopeReveal />"
    : ["    <EnvelopeReveal", ...changedProps, "    />"].join("\n");

  return [
    `import { EnvelopeReveal } from ${serializeString(definition.importPath)};`,
    `import ${serializeString(definition.cssImportPath)};`,
    "",
    "// Workspace import: @frillab/interactive is private and is not published to npm.",
    "export function Example() {",
    "  return (",
    component,
    "  );",
    "}",
  ].join("\n");
}

function registerComponent<Props extends StringProps>(
  definition: ComponentDefinition<Props>,
): ComponentRegistration {
  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    defaultProps: definition.defaultProps,
    controls: definition.controls.map(({ key, label, kind }) => ({ key: String(key), label, kind })),
    render: (props) => createElement(definition.Preview, props as Props),
    generateUsageCode: (props) => createUsageCode(definition, props as Props),
    sourceText: definition.sourceText,
  };
}

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

const envelopeRevealSource = [
  "FrilCraft Envelope Reveal source copy",
  "",
  "Copy each labeled block into a file with the shown name.",
  "Dependencies: React 18 or 19. No animation library or Three.js is required.",
  "Import envelope-reveal.css once from your application entrypoint.",
  "Preserve the included MIT license notice when redistributing this source.",
  "",
  "===== EnvelopeReveal.tsx =====",
  componentSource.trimEnd(),
  "",
  "===== index.ts =====",
  componentIndexSource.trimEnd(),
  "",
  "===== envelope-reveal.css =====",
  componentStyles.trimEnd(),
  "",
  "===== LICENSE (MIT) =====",
  licenseText.trimEnd(),
].join("\n");

const envelopeReveal = registerComponent<EnvelopeRevealPlaygroundProps>({
  id: "envelope-reveal",
  name: "Envelope Reveal",
  description: "A letter animation built with React and CSS.",
  category: "Interactive",
  importPath: "@frillab/interactive/envelope-reveal",
  cssImportPath: "@frillab/interactive/envelope-reveal.css",
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
  sourceText: envelopeRevealSource,
});

export const componentCatalog: readonly ComponentRegistration[] = [envelopeReveal];
