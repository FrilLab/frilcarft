import { componentCatalog } from "./catalog/index.js";
import { ComponentDetail } from "./ComponentDetail.js";
import { ComponentGallery } from "./ComponentGallery.js";
import { SiteLink, useLocation } from "./navigation.js";

/**
 * App owns the site shell and URL routing.
 * Gallery and component detail both read from the same catalog.
 */
function App() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const onGallery = segments.length === 0;
  const selectedComponent = segments.length === 2 && segments[0] === "components"
    ? componentCatalog.find((component) => component.id === segments[1])
    : undefined;

  return (
    <div className="playground-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <SiteLink className="brand" href="/" aria-label="FrilCraft home">
            FrilCraft<span aria-hidden="true">.</span>
          </SiteLink>
          <nav className="site-navigation" aria-label="Main navigation">
            <SiteLink href="/" aria-current={onGallery ? "page" : undefined}>Components</SiteLink>
            <a href="https://github.com/FrilLab/frilcraft" target="_blank" rel="noreferrer">GitHub<span className="external-arrow" aria-hidden="true">↗</span></a>
          </nav>
        </div>
      </header>

      <main className="main-content" id="top">
        {onGallery ? (
          <ComponentGallery search={location.search} />
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
