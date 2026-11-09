import { createElement } from "react";
import type { ComponentDetailDefinition, ComponentDetailRegistration, PlaygroundProps, PlaygroundValue, UsageCodeDefinition } from "./types.js";

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
  const imports = [
    `import { ${definition.componentName} } from ${serializeString(definition.importPath)};`,
    ...(definition.cssImportPath ? [`import ${serializeString(definition.cssImportPath)};`] : []),
  ];

  return [
    ...imports,
    "",
    ...(definition.usageNote ? [`// ${definition.usageNote}`, ""] : []),
    "export function Example() {",
    "  return (",
    component,
    "  );",
    "}",
  ].join("\n");
}

export function registerComponent<Props extends { [Key in keyof Props]: PlaygroundValue }>(
  definition: ComponentDetailDefinition<Props>,
): ComponentDetailRegistration {
  return {
    defaultProps: definition.defaultProps,
    controls: definition.controls.map(({ key, label, description, kind }) => ({ key: String(key), label, description, kind })),
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
    }, props as typeof definition.defaultProps),
  };
}
