import type { ComponentType, ReactNode } from "react";
import type { ComponentCategory, ComponentTag } from "./metadata.js";

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

export interface ComponentDetailDefinition<Props extends { [Key in keyof Props]: PlaygroundValue }> {
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
  readonly previewHint?: string;
  readonly previewFeatures?: readonly string[];
}

export interface ComponentDetailRegistration {
  readonly defaultProps: PlaygroundProps;
  readonly controls: readonly PlaygroundControl[];
  readonly previewHint?: string;
  readonly previewFeatures: readonly string[];
  readonly sourceFiles: readonly SourceFile[];
  readonly sourceInstructions: string;
  readonly render: (props: PlaygroundProps) => ReactNode;
  readonly generateUsageCode: (props: PlaygroundProps, target: "workspace" | "source") => string;
}

export interface ComponentCatalogEntry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ComponentCategory;
  readonly tags: readonly ComponentTag[];
  readonly badges: readonly string[];
  readonly installable: boolean;
  readonly previewImage?: string;
  readonly load: () => Promise<ComponentDetailRegistration>;
}
