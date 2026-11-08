import { useMemo, useState } from "react";
import { componentCatalog } from "./catalog.js";
import type { ComponentRegistration } from "./catalog.js";

type CodeView = "usage" | "source";

function App() {
  const [selectedId, setSelectedId] = useState(componentCatalog[0].id);
  const [values, setValues] = useState<Record<string, string>>(componentCatalog[0].defaultProps);
  const [codeView, setCodeView] = useState<CodeView>("usage");
  const [copyStatus, setCopyStatus] = useState("");

  const selectedComponent = componentCatalog.find(({ id }) => id === selectedId) ?? componentCatalog[0];
  const usageCode = useMemo(
    () => selectedComponent.generateUsageCode(values),
    [selectedComponent, values],
  );
  const displayedCode = codeView === "usage" ? usageCode : selectedComponent.sourceText;
  const copyLabel = codeView === "usage" ? "Copy usage code" : "Copy component source";

  const updateProperty = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setCopyStatus("");
  };

  const selectComponent = (component: ComponentRegistration) => {
    setSelectedId(component.id);
    setValues(component.defaultProps);
    setCopyStatus("");
  };

  const resetProperties = () => {
    setValues(selectedComponent.defaultProps);
    setCopyStatus("");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(displayedCode);
      setCopyStatus(codeView === "usage" ? "Usage code copied." : "Component source copied.");
    } catch {
      setCopyStatus("Copy failed. Select the code in the panel and copy it manually.");
    }
  };

  return (
    <div className="playground-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="FrilCraft Playground home">
          <span className="brand-mark" aria-hidden="true">f</span>
          <span>frilcraft<span className="brand-dot">.</span></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <div className="workspace-name">
          <span className="workspace-avatar" aria-hidden="true">F</span>
          <span>Component studio</span>
          <span className="workspace-chevron" aria-hidden="true">⌄</span>
        </div>
        <nav className="component-navigation" aria-label="Components">
          <div className="sidebar-label navigation-label">COMPONENTS <span>{componentCatalog.length}</span></div>
          {componentCatalog.map((component) => (
            <button
              className={`component-nav-item${selectedComponent.id === component.id ? " is-active" : ""}`}
              key={component.id}
              type="button"
              aria-current={selectedComponent.id === component.id ? "page" : undefined}
              onClick={() => selectComponent(component)}
            >
              <span className="nav-item-icon" aria-hidden="true">✳</span>
              <span>{component.name}</span>
              <span className="nav-item-indicator" aria-hidden="true" />
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" aria-hidden="true" />
          Prototype workspace
        </div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar">
          <div className="breadcrumbs"><span>Components</span><span aria-hidden="true">/</span><strong>{selectedComponent.name}</strong></div>
          <div className="topbar-meta"><span className="live-indicator" /> Live preview <span className="version-pill">v0.0.0</span></div>
        </header>

        <div className="page-content">
          <section className="component-heading" aria-labelledby="component-title">
            <div>
              <div className="eyebrow-label">{selectedComponent.category} <span>·</span> React component</div>
              <h1 id="component-title">{selectedComponent.name}</h1>
              <p>{selectedComponent.description} Adjust the details and preview your changes instantly.</p>
            </div>
            <div className="heading-badges">
              <span className="native-badge"><span aria-hidden="true">✦</span> CSS motion</span>
              <span className="react-badge">◉ React</span>
            </div>
          </section>

          <section className="editor-grid" aria-label={`${selectedComponent.name} editor`}>
            <div className="preview-card">
              <div className="card-heading">
                <div>
                  <span className="card-kicker">CANVAS</span>
                  <h2>Live preview</h2>
                </div>
                <span className="preview-state"><span /> Interactive</span>
              </div>
              <div className="preview-canvas">
                <div className="canvas-glow" aria-hidden="true" />
                <div className="preview-component">{selectedComponent.render(values)}</div>
                <div className="canvas-caption"><span className="caption-line" /> Click the envelope to open it <span className="caption-line" /></div>
              </div>
              <div className="preview-footer">
                <span><span className="keyboard-icon" aria-hidden="true">↵</span> Keyboard accessible</span>
                <span><span className="motion-icon" aria-hidden="true">◌</span> Reduced motion supported</span>
                <span className="preview-size">Responsive preview</span>
              </div>
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
                  const value = values[String(control.key)] ?? "";
                  return (
                    <label className={`property-control property-control--${control.kind}`} key={String(control.key)}>
                      <span className="control-label">{control.label}</span>
                      {control.kind === "textarea" ? (
                        <textarea
                          value={value}
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
                            value={value}
                            onChange={(event) => updateProperty(String(control.key), event.target.value)}
                          />
                          <span className="color-value">{value.toUpperCase()}</span>
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={value}
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
              <button className="copy-button" type="button" onClick={copyCode}>
                <span aria-hidden="true">▢</span> {copyLabel}
              </button>
            </div>
            <div className="code-toolbar">
              <div className="code-tabs" role="tablist" aria-label="Code type">
                <button
                  id="usage-tab"
                  className={codeView === "usage" ? "is-selected" : ""}
                  type="button"
                  role="tab"
                  aria-selected={codeView === "usage"}
                  aria-controls="code-panel"
                  onClick={() => { setCodeView("usage"); setCopyStatus(""); }}
                >
                  <span aria-hidden="true">⌘</span> Usage
                </button>
                <button
                  id="source-tab"
                  className={codeView === "source" ? "is-selected" : ""}
                  type="button"
                  role="tab"
                  aria-selected={codeView === "source"}
                  aria-controls="code-panel"
                  onClick={() => { setCodeView("source"); setCopyStatus(""); }}
                >
                  <span aria-hidden="true">{ }</span> Component source
                </button>
              </div>
              <span className="code-language">{codeView === "usage" ? "TSX" : "SOURCE FILES"}</span>
            </div>
            <div className="code-panel" id="code-panel" role="tabpanel" aria-labelledby={codeView === "usage" ? "usage-tab" : "source-tab"}>
              <pre><code>{displayedCode}</code></pre>
            </div>
            <div className="code-footer">
              <span aria-live="polite" role="status">{copyStatus || "Workspace import shown. The package is private and not published to npm."}</span>
              {codeView === "source" && <span className="source-dependencies">React 18 or 19 · CSS file included · MIT license included</span>}
            </div>
          </section>

          <footer className="page-footer">
            <span>FrilCraft <span aria-hidden="true">·</span> Interactive experiences, thoughtfully made.</span>
            <span>Prototype · Not yet published</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
