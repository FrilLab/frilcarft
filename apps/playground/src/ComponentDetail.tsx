import { useEffect, useMemo, useState } from "react";
import type { ComponentCatalogEntry, ComponentDetailRegistration, PlaygroundProps, PlaygroundValue } from "./catalog/index.js";
import {
  createFrilAddComponentCommand,
  createFrilAddQualifiedComponentCommand,
  createFrilAddRegistrationCommand,
} from "./lib/friladd.js";

type CodeView = "copied-source-usage" | "workspace-usage" | "source-files";
type InstallCopyKey = "registration" | "install" | "qualified";
const registrationCommand = createFrilAddRegistrationCommand();

/** Load a detail registration only after its route is selected. */
export function ComponentDetail({ selectedComponent }: { selectedComponent: ComponentCatalogEntry }) {
  const [attempt, setAttempt] = useState(0);
  const [loadState, setLoadState] = useState<
    | { id: string; status: "loading" }
    | { id: string; status: "loaded"; detail: ComponentDetailRegistration }
    | { id: string; status: "error" }
  >({ id: selectedComponent.id, status: "loading" });

  useEffect(() => {
    let active = true;
    setLoadState({ id: selectedComponent.id, status: "loading" });
    selectedComponent.load().then(
      (detail) => {
        if (active) setLoadState({ id: selectedComponent.id, status: "loaded", detail });
      },
      () => {
        if (active) setLoadState({ id: selectedComponent.id, status: "error" });
      },
    );
    return () => { active = false; };
  }, [selectedComponent, attempt]);

  if (loadState.id !== selectedComponent.id || loadState.status === "loading") {
    return <div className="page-content detail-loading" role="status" aria-live="polite">Loading {selectedComponent.name}…</div>;
  }

  if (loadState.status === "error") {
    return (
      <div className="page-content not-found-page detail-load-error" role="alert">
        <div className="eyebrow-label">DETAIL UNAVAILABLE</div>
        <h1>Could not load {selectedComponent.name}.</h1>
        <p>The component detail module failed to load. Check your connection and try again.</p>
        <button type="button" className="return-to-gallery" onClick={() => setAttempt((value) => value + 1)}>Try again</button>
      </div>
    );
  }

  return <ComponentDetailEditor key={selectedComponent.id} selectedComponent={selectedComponent} detail={loadState.detail} />;
}

/** Editor for one registered component; it does not own site navigation. */
function ComponentDetailEditor({
  selectedComponent,
  detail,
}: {
  selectedComponent: ComponentCatalogEntry;
  detail: ComponentDetailRegistration;
}) {
  const [values, setValues] = useState<PlaygroundProps>(detail.defaultProps);
  const [codeView, setCodeView] = useState<CodeView>("copied-source-usage");
  const [copyStatus, setCopyStatus] = useState("");
  const [installCopyStatus, setInstallCopyStatus] = useState<Partial<Record<InstallCopyKey, string>>>({});

  const usageCode = useMemo(
    () => detail.generateUsageCode(values, codeView === "workspace-usage" ? "workspace" : "source"),
    [detail, values, codeView],
  );
  const isUsageView = codeView !== "source-files";

  const updateProperty = (key: string, value: PlaygroundValue) => {
    setValues((current) => ({ ...current, [key]: value }));
    setCopyStatus("");
  };

  const resetProperties = () => {
    setValues(detail.defaultProps);
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

  const copyInstallCommand = async (key: InstallCopyKey, command: string, label: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setInstallCopyStatus((current) => ({ ...current, [key]: `${label} copied.` }));
    } catch {
      setInstallCopyStatus((current) => ({
        ...current,
        [key]: `Copy failed for ${label.toLowerCase()}. Select the command and copy it manually.`,
      }));
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
            <div className="preview-component">{detail.render(values)}</div>
            {detail.previewHint && (
              <div className="canvas-caption"><span className="caption-line" /> {detail.previewHint} <span className="caption-line" /></div>
            )}
          </div>
          {detail.previewFeatures.length > 0 && (
            <div className="preview-footer">
              {detail.previewFeatures.map((feature) => <span key={feature}>{feature}</span>)}
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
            {detail.controls.map((control) => {
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
        <section className="friladd-install" aria-labelledby="friladd-install-title">
          <div className="friladd-install-heading">
            <span className="card-kicker">RECOMMENDED INSTALLER · FRILADD LATEST</span>
            <h3 id="friladd-install-title">Install with FrilAdd</h3>
            <p>Register FrilCraft once, then install this component with a short command. FrilAdd copies the selected component files into your project.</p>
          </div>
          {selectedComponent.installable ? (
            <>
              <div className="friladd-step">
                <div className="friladd-step-title">
                  <span>STEP 1</span>
                  <h4>Register FrilCraft</h4>
                </div>
                <div className="friladd-command-row">
                  <pre><code>{registrationCommand}</code></pre>
                  <button
                    className="copy-button"
                    type="button"
                    aria-label="Copy FrilAdd registration command"
                    onClick={() => copyInstallCommand("registration", registrationCommand, "Registration command")}
                  >
                    <span aria-hidden="true">▢</span> Copy
                  </button>
                </div>
                <p className="friladd-help">Run once for a global setup. <code>--global</code> makes the Registry available across projects; <code>--default</code> sets FrilCraft as your default and can replace your current default Registry selection. Omit <code>--default</code> to keep that selection.</p>
                <span className="friladd-copy-status" aria-live="polite">{installCopyStatus.registration ?? ""}</span>
              </div>

              <div className="friladd-step friladd-step--primary">
                <div className="friladd-step-title">
                  <span>STEP 2</span>
                  <h4>Install {selectedComponent.name}</h4>
                </div>
                <div className="friladd-command-row">
                  <pre><code>{createFrilAddComponentCommand(selectedComponent.id)}</code></pre>
                  <button
                    className="copy-button"
                    type="button"
                    aria-label={`Copy ${selectedComponent.name} install command`}
                    onClick={() => copyInstallCommand("install", createFrilAddComponentCommand(selectedComponent.id), "Install command")}
                  >
                    <span aria-hidden="true">▢</span> Copy
                  </button>
                </div>
                <span className="friladd-copy-status" aria-live="polite">{installCopyStatus.install ?? ""}</span>
                <details className="friladd-alternative">
                  <summary>Alternative: use the explicit Registry alias</summary>
                  <p>Use this after registering the FrilCraft alias when you do not want it to be your default Registry.</p>
                  <div className="friladd-command-row">
                    <pre><code>{createFrilAddQualifiedComponentCommand(selectedComponent.id)}</code></pre>
                    <button
                      className="copy-button"
                      type="button"
                      aria-label={`Copy ${selectedComponent.name} qualified install command`}
                      onClick={() => copyInstallCommand("qualified", createFrilAddQualifiedComponentCommand(selectedComponent.id), "Qualified install command")}
                    >
                      <span aria-hidden="true">▢</span> Copy
                    </button>
                  </div>
                  <span className="friladd-copy-status" aria-live="polite">{installCopyStatus.qualified ?? ""}</span>
                </details>
              </div>
            </>
          ) : (
            <p className="friladd-unavailable">This preview is not registered in the FrilCraft Registry, so it cannot be installed with FrilAdd yet.</p>
          )}
        </section>
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
          <span className="code-language">{isUsageView ? "TSX" : `${detail.sourceFiles.length} FILES`}</span>
        </div>
        <div className={`code-panel${isUsageView ? "" : " code-panel--files"}`} id="code-panel" role="tabpanel" aria-labelledby={`${codeView}-tab`}>
          {isUsageView ? (
            <pre><code>{usageCode}</code></pre>
          ) : (
            <div className="source-files-list">
              <p className="source-instructions">{detail.sourceInstructions}</p>
              {detail.sourceFiles.map((file) => (
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
