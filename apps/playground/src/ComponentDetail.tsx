import { useMemo, useState } from "react";
import type { ComponentRegistration, PlaygroundProps, PlaygroundValue } from "./catalog.js";

type CodeView = "copied-source-usage" | "workspace-usage" | "source-files";

/** Editor for one registered component; it does not own site navigation. */
export function ComponentDetail({ selectedComponent }: { selectedComponent: ComponentRegistration }) {
  const [values, setValues] = useState<PlaygroundProps>(selectedComponent.defaultProps);
  const [codeView, setCodeView] = useState<CodeView>("copied-source-usage");
  const [copyStatus, setCopyStatus] = useState("");

  const usageCode = useMemo(
    () => selectedComponent.generateUsageCode(values, codeView === "workspace-usage" ? "workspace" : "source"),
    [selectedComponent, values, codeView],
  );
  const isUsageView = codeView !== "source-files";

  const updateProperty = (key: string, value: PlaygroundValue) => {
    setValues((current) => ({ ...current, [key]: value }));
    setCopyStatus("");
  };

  const resetProperties = () => {
    setValues(selectedComponent.defaultProps);
    setCopyStatus("");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(usageCode);
      setCopyStatus(codeView === "workspace-usage" ? "Workspace usage copied." : "Copied-source usage copied.");
    } catch {
      setCopyStatus("Copy failed. Select the code in the panel and copy it manually.");
    }
  };

  const copySourceFile = async (path: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus(`${path} copied.`);
    } catch {
      setCopyStatus(`Copy failed for ${path}. Select the file contents and copy them manually.`);
    }
  };

  const setCodeViewAndClearStatus = (view: CodeView) => {
    setCodeView(view);
    setCopyStatus("");
  };

  return (
    <div className="page-content">
      <section className="component-heading" aria-labelledby="component-title">
        <div>
          <div className="eyebrow-label">{selectedComponent.category} <span>·</span> React component</div>
          <h1 id="component-title">{selectedComponent.name}</h1>
          <p>{selectedComponent.description} Adjust the details and preview your changes instantly.</p>
        </div>
        <div className="heading-badges">
          {selectedComponent.badges.map((badge) => <span className="component-badge" key={badge}>{badge}</span>)}
        </div>
      </section>

      <section className="editor-grid" aria-label={`${selectedComponent.name} editor`}>
        <div className="preview-card">
          <div className="card-heading">
            <div>
              <span className="card-kicker">PREVIEW</span>
              <h2>Live preview</h2>
            </div>
            <span className="preview-state">Preview</span>
          </div>
          <div className="preview-canvas">
            <div className="canvas-glow" aria-hidden="true" />
            <div className="preview-component">{selectedComponent.render(values)}</div>
            {selectedComponent.previewHint && (
              <div className="canvas-caption"><span className="caption-line" /> {selectedComponent.previewHint} <span className="caption-line" /></div>
            )}
          </div>
          {selectedComponent.previewFeatures.length > 0 && (
            <div className="preview-footer">
              {selectedComponent.previewFeatures.map((feature) => <span key={feature}>{feature}</span>)}
            </div>
          )}
        </div>

        <aside className="controls-card" aria-labelledby="controls-title">
          <div className="card-heading controls-heading">
            <div>
              <span className="card-kicker">CUSTOMIZE</span>
              <h2 id="controls-title">Properties</h2>
            </div>
            <button className="reset-button" type="button" onClick={resetProperties}>
              <span aria-hidden="true">↺</span> Reset
            </button>
          </div>

          <div className="controls-list">
            {selectedComponent.controls.map((control) => {
              const value = values[String(control.key)];
              const stringValue = typeof value === "string" ? value : value === undefined ? "" : String(value);
              return (
                <label className={`property-control property-control--${control.kind}`} key={String(control.key)}>
                  <span className="control-label">{control.label}</span>
                  {control.kind === "textarea" ? (
                    <textarea
                      value={stringValue}
                      rows={3}
                      maxLength={240}
                      onChange={(event) => updateProperty(String(control.key), event.target.value)}
                    />
                  ) : control.kind === "color" ? (
                    <span className="color-input-wrap">
                      <input
                        className="color-input"
                        type="color"
                        aria-label={control.label}
                        value={stringValue}
                        onChange={(event) => updateProperty(String(control.key), event.target.value)}
                      />
                      <span className="color-value">{stringValue.toUpperCase()}</span>
                    </span>
                  ) : control.kind === "boolean" ? (
                    <input
                      type="checkbox"
                      checked={value === true}
                      onChange={(event) => updateProperty(String(control.key), event.target.checked)}
                    />
                  ) : control.kind === "number" ? (
                    <input
                      type="number"
                      value={typeof value === "number" ? value : ""}
                      step="any"
                      onChange={(event) => {
                        const nextValue = event.target.value === "" ? undefined : event.target.valueAsNumber;
                        updateProperty(String(control.key), typeof nextValue === "number" && Number.isFinite(nextValue) ? nextValue : undefined);
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={stringValue}
                      maxLength={120}
                      onChange={(event) => updateProperty(String(control.key), event.target.value)}
                    />
                  )}
                </label>
              );
            })}
          </div>
          <p className="controls-note"><span aria-hidden="true">ⓘ</span> Changes are reflected in the preview and usage code.</p>
        </aside>
      </section>

      <section className="code-card" aria-labelledby="code-title">
        <div className="code-card-heading">
          <div>
            <span className="card-kicker">TAKE IT WITH YOU</span>
            <h2 id="code-title">Use it in your project</h2>
          </div>
          {isUsageView && (
            <button className="copy-button" type="button" onClick={copyCode}>
              <span aria-hidden="true">▢</span> {codeView === "workspace-usage" ? "Copy workspace usage" : "Copy local source usage"}
            </button>
          )}
        </div>
        <div className="code-toolbar">
          <div className="code-tabs" role="tablist" aria-label="Code type">
            <button
              id="copied-source-usage-tab"
              className={codeView === "copied-source-usage" ? "is-selected" : ""}
              type="button"
              role="tab"
              aria-selected={codeView === "copied-source-usage"}
              aria-controls="code-panel"
              onClick={() => setCodeViewAndClearStatus("copied-source-usage")}
            >
              Copied Source Usage
            </button>
            <button
              id="workspace-usage-tab"
              className={codeView === "workspace-usage" ? "is-selected" : ""}
              type="button"
              role="tab"
              aria-selected={codeView === "workspace-usage"}
              aria-controls="code-panel"
              onClick={() => setCodeViewAndClearStatus("workspace-usage")}
            >
              Workspace Usage
            </button>
            <button
              id="source-files-tab"
              className={codeView === "source-files" ? "is-selected" : ""}
              type="button"
              role="tab"
              aria-selected={codeView === "source-files"}
              aria-controls="code-panel"
              onClick={() => setCodeViewAndClearStatus("source-files")}
            >
              Source Files
            </button>
          </div>
          <span className="code-language">{isUsageView ? "TSX" : `${selectedComponent.sourceFiles.length} FILES`}</span>
        </div>
        <div className={`code-panel${isUsageView ? "" : " code-panel--files"}`} id="code-panel" role="tabpanel" aria-labelledby={`${codeView}-tab`}>
          {isUsageView ? (
            <pre><code>{usageCode}</code></pre>
          ) : (
            <div className="source-files-list">
              <p className="source-instructions">{selectedComponent.sourceInstructions}</p>
              {selectedComponent.sourceFiles.map((file) => (
                <section className="source-file" key={file.path} aria-label={`Source file ${file.path}`}>
                  <div className="source-file-heading">
                    <strong>{file.path}</strong>
                    <button type="button" onClick={() => copySourceFile(file.path, file.content)}>Copy {file.path}</button>
                  </div>
                  <pre><code>{file.content}</code></pre>
                </section>
              ))}
            </div>
          )}
        </div>
        <div className="code-footer">
          <span aria-live="polite" role="status">{copyStatus || (codeView === "workspace-usage"
            ? "Workspace Usage imports the private, unpublished @frillab/interactive package."
            : codeView === "copied-source-usage"
              ? "Copied Source Usage imports local component files and is the external usage example."
              : "Copy the listed files individually; the LICENSE file preserves the MIT notice.")}</span>
        </div>
      </section>

      <footer className="page-footer">
        <span>FrilCraft <span aria-hidden="true">·</span> Interactive experiences, thoughtfully made.</span>
        <span>Prototype · Not yet published</span>
      </footer>
    </div>
  );
}
