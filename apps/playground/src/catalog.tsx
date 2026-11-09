import { createElement } from "react";
import type { ComponentType, ReactNode } from "react";
import { EnvelopeReveal } from "@frillab/interactive/envelope-reveal";
import type { EnvelopeRevealProps } from "@frillab/interactive/envelope-reveal";
import componentSource from "../../../packages/interactive/src/components/envelope-reveal/EnvelopeReveal.tsx?raw";
import componentIndexSource from "../../../packages/interactive/src/components/envelope-reveal/index.ts?raw";
import componentStyles from "../../../packages/interactive/src/components/envelope-reveal/envelope-reveal.css?sourceText";
import licenseText from "../../../LICENSE?raw";

export type PlaygroundValue = string | number | boolean | undefined;
export type PlaygroundProps = Record<string, PlaygroundValue>;

export type ControlKind = "text" | "textarea" | "color" | "number" | "boolean";

export interface PlaygroundControl<Props extends object = PlaygroundProps> {
  readonly key: keyof Props;
  readonly label: string;
  readonly kind: ControlKind;
}

export interface UsageCodeDefinition<Props extends { [Key in keyof Props]: PlaygroundValue } = PlaygroundProps> {
  readonly componentName: string;
  readonly importPath: string;
  readonly cssImportPath: string;
  readonly defaultProps: Props;
  readonly controls: readonly PlaygroundControl<Props>[];
  readonly usageNote?: string;
}

export interface SourceFile {
  readonly path: string;
  readonly content: string;
}

interface ComponentDefinition<Props extends { [Key in keyof Props]: PlaygroundValue }> {
  readonly id: string;
  readonly installable?: boolean;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly componentName: string;
  readonly workspaceImportPath: string;
  readonly workspaceCssImportPath: string;
  readonly sourceImportPath: string;
  readonly sourceCssImportPath: string;
  readonly Preview: ComponentType<Props>;
  readonly defaultProps: Props;
  readonly controls: readonly PlaygroundControl<Props>[];
  readonly sourceFiles: readonly SourceFile[];
  readonly sourceInstructions: string;
  readonly badges: readonly string[];
  readonly previewImage?: string;
  readonly previewHint?: string;
  readonly previewFeatures?: readonly string[];
}

export interface ComponentRegistration {
  readonly id: string;
  readonly installable: boolean;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly defaultProps: PlaygroundProps;
  readonly controls: readonly PlaygroundControl[];
  readonly badges: readonly string[];
  readonly previewImage?: string;
  readonly previewHint?: string;
  readonly previewFeatures: readonly string[];
  readonly sourceFiles: readonly SourceFile[];
  readonly sourceInstructions: string;
  readonly render: (props: PlaygroundProps) => ReactNode;
  readonly generateUsageCode: (props: PlaygroundProps, target: "workspace" | "source") => string;
}

export function serializeString(value: string): string {
  return JSON.stringify(value)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function serializeJsxValue(value: PlaygroundValue): string {
  if (typeof value === "string") return `{${serializeString(value)}}`;
  if (typeof value === "boolean") return `{${value}}`;
  if (typeof value === "number" && Number.isFinite(value)) return `{${String(value)}}`;
  throw new TypeError(`Unsupported JSX property value: ${String(value)}`);
}

/** Generate a usage example from explicit component and prop metadata. */
export function createUsageCode<Props extends { [Key in keyof Props]: PlaygroundValue }>(
  definition: UsageCodeDefinition<Props>,
  props: Props,
): string {
  const changedProps = definition.controls.flatMap(({ key }) => {
    const value = props[key];
    if (value === undefined || value === definition.defaultProps[key]) return [];
    return [`      ${String(key)}=${serializeJsxValue(value)}`];
  });

  const component = changedProps.length === 0
    ? `    <${definition.componentName} />`
    : [`    <${definition.componentName}`, ...changedProps, "    />"].join("\n");

  return [
    `import { ${definition.componentName} } from ${serializeString(definition.importPath)};`,
    `import ${serializeString(definition.cssImportPath)};`,
    "",
    ...(definition.usageNote ? [`// ${definition.usageNote}`, ""] : []),
    "export function Example() {",
    "  return (",
    component,
    "  );",
    "}",
  ].join("\n");
}

function registerComponent<Props extends { [Key in keyof Props]: PlaygroundValue }>(
  definition: ComponentDefinition<Props>,
): ComponentRegistration {
  return {
    id: definition.id,
    installable: definition.installable ?? false,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    defaultProps: definition.defaultProps,
    controls: definition.controls.map(({ key, label, kind }) => ({ key: String(key), label, kind })),
    badges: definition.badges,
    previewImage: definition.previewImage,
    previewHint: definition.previewHint,
    previewFeatures: definition.previewFeatures ?? [],
    sourceFiles: definition.sourceFiles,
    sourceInstructions: definition.sourceInstructions,
    render: (props) => createElement(definition.Preview, props as Props),
    generateUsageCode: (props, target) => createUsageCode({
      componentName: definition.componentName,
      importPath: target === "workspace" ? definition.workspaceImportPath : definition.sourceImportPath,
      cssImportPath: target === "workspace" ? definition.workspaceCssImportPath : definition.sourceCssImportPath,
      defaultProps: definition.defaultProps,
      controls: definition.controls,
      usageNote: target === "workspace"
        ? "Workspace usage only: @frillab/interactive is private and unpublished."
        : "Copied source usage: place the component files at the paths shown in the source instructions.",
    }, props as Props),
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

const envelopeReveal = registerComponent<EnvelopeRevealPlaygroundProps>({
  id: "envelope-reveal",
  installable: true,
  name: "Envelope Reveal",
  description: "A letter animation built with React and CSS.",
  category: "Interactive",
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
  badges: ["React", "CSS motion"],
  previewImage: "/previews/envelope-reveal.svg",
  previewHint: "Click the envelope to open it",
  previewFeatures: ["Keyboard accessible", "Reduced motion supported"],
});

export const componentCatalog: readonly ComponentRegistration[] = [envelopeReveal];
