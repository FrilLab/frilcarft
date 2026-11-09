import ts from "typescript-api";
import { describe, expect, it } from "vitest";
import { createUsageCode } from "./codegen.js";
import type { UsageCodeDefinition } from "./types.js";

interface SyntheticProps {
  caption?: string;
  count?: number;
  enabled?: boolean;
  optionalNote?: string;
}

const syntheticDefinition: UsageCodeDefinition<SyntheticProps> = {
  componentName: "PosterCard",
  importPath: "@example/poster-card",
  cssImportPath: "@example/poster-card/styles.css",
  defaultProps: {
    caption: "Default caption",
    count: 0,
    enabled: false,
    optionalNote: undefined,
  },
  controls: [
    { key: "caption", label: "Caption", kind: "textarea" },
    { key: "count", label: "Count", kind: "number" },
    { key: "enabled", label: "Enabled", kind: "boolean" },
    { key: "optionalNote", label: "Optional note", kind: "text" },
  ],
};

describe("createUsageCode", () => {
  it("serializes string, number, and boolean props and produces valid TSX", () => {
    const caption = 'A "quoted" path \\ across lines\n한글 🌈';
    const code = createUsageCode(syntheticDefinition, {
      caption,
      count: 4.5,
      enabled: true,
      optionalNote: undefined,
    });

    expect(code).toContain('import { PosterCard } from "@example/poster-card";');
    expect(code).toContain('import "@example/poster-card/styles.css";');
    expect(code).toContain(`<PosterCard\n      caption={${JSON.stringify(caption)}}\n      count={4.5}\n      enabled={true}\n    />`);
    expect(code).not.toContain("optionalNote=");

    const diagnostics = ts.transpileModule(code, {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
      reportDiagnostics: true,
    }).diagnostics;
    expect(diagnostics?.filter(({ category }) => category === ts.DiagnosticCategory.Error)).toHaveLength(0);
  });

  it("omits default and undefined optional properties", () => {
    const code = createUsageCode(syntheticDefinition, {
      caption: "Default caption",
      count: 0,
      enabled: false,
      optionalNote: undefined,
    });

    expect(code).toContain("<PosterCard />");
    expect(code).not.toContain("caption=");
    expect(code).not.toContain("count=");
    expect(code).not.toContain("enabled=");
    expect(code).not.toContain("optionalNote=");
  });
});
