import { componentCatalog } from "./catalog.js";
import { ComponentDetail } from "./ComponentDetail.js";
import { ComponentGallery } from "./ComponentGallery.js";
import { SiteLink, usePathname } from "./navigation.js";

/**
 * App owns the site shell and URL routing.
 * Gallery and component detail both read from the same catalog.
 */
function App() {
  const pathname = usePathname().replace(/\\/+$/, "") || "/";
  const match = /^\\/components\\/([a-z0-9-]+)$/.exec(pathname);
  const selectedComponent = match
    ? componentCatalog.find((component) => component.id === match[1])
    : undefined;
  const onGallery = pathname === "/";

  return (
    <div className="playground-shell">
      <aside className="sidebar">
        <SiteLink className="brand" href="/" aria-label="FrilCraft Playground home">
          <span className="brand-mark" aria-hidden="true">f</span>
          <span>frilcraft<span className="brand-dot">.</span></span>
        </SiteLink>
        <div className="sidebar-label">WORKSPACE</div>
        <div className="workspace-name">
          <span className="workspace-avatar" aria-hidden="true">F</span>
          <span>Component studio</span>
          <span className="workspace-chevron" aria-hidden="true">⌄</span>
        </div>
        <nav className="component-navigation" aria-label="Components">
          <div className="sidebar-label navigation-label">
            COMPONENTS <span>{componentCatalog.length}</span>
          </div>
          <SiteLink
            href="/"
            className={`component-nav-item${onGallery ? " is-active" : ""}`}
            aria-current={onGallery ? "page" : undefined}
          >
            <span className="nav-item-icon" aria-hidden="true">▦</span>
            <span>All components</span>
            <span className="nav-item-indicator" aria-hidden="true" />
          </SiteLink>
          {componentCatalog.map((component) => (
            <SiteLink
              className={`component-nav-item${selectedComponent?.id === component.id ? " is-active" : ""}`}
              key={component.id}
              href={`/components/${component.id}`}
              aria-current={selectedComponent?.id === component.id ? "page" : undefined}
            >
              <span className="nav-item-icon" aria-hidden="true">✳</span>
              <span>{component.name}</span>
              <span className="nav-item-indicator" aria-hidden="true" />
            </SiteLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" aria-hidden="true" />
          Prototype workspace
        </div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar">
          <div className="breadcrumbs">
            {onGallery ? (
              <strong>Components</strong>
            ) : (
              <>
                <SiteLink href="/">Components</SiteLink>
                <span aria-hidden="true">/</span>
                <strong>{selectedComponent?.name ?? "Not found"}</strong>
              </>
            )}
          </div>
          <div className="topbar-meta">
            <span className="live-indicator" />
            FrilCraft Playground
            <span className="version-pill">v0.0.0</span>
          </div>
        </header>
        {onGallery ? (
          <ComponentGallery />
        ) : selectedComponent ? (
          <ComponentDetail key={selectedComponent.id} selectedComponent={selectedComponent} />
        ) : (
          <div className="page-content not-found-page">
            <div className="eyebrow-label">NOT FOUND</div>
            <h1>Component not found.</h1>
            <p>The requested component is not registered in this Playground.</p>
            <SiteLink href="/" className="return-to-gallery">Back to all components</SiteLink>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
