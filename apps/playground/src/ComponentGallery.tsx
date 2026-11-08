import { componentCatalog } from "./catalog.js";
import { SiteLink } from "./navigation.js";

/** The home page lists only components that are actually registered. */
export function ComponentGallery() {
  return (
    <div className="page-content gallery-page">
      <header className="gallery-intro">
        <div className="eyebrow-label">THE COMPONENT LIBRARY</div>
        <h1>Explore components.</h1>
        <p>Discover interactive experiences, preview each component, customize its properties, and copy the code into your own project.</p>
        <span className="gallery-count">{componentCatalog.length} {componentCatalog.length === 1 ? "component" : "components"} available</span>
      </header>
      {componentCatalog.length === 0 ? (
        <p className="gallery-empty">No components have been registered yet.</p>
      ) : (
        <div className="gallery-grid" aria-label="Component gallery">
          {componentCatalog.map((component) => (
            <SiteLink
              key={component.id}
              href={`/components/${component.id}`}
              className="gallery-card"
              aria-label={`Explore ${component.name}`}
            >
              <div className="gallery-card-artwork">
                {component.previewImage ? (
                  <img src={component.previewImage} alt="" loading="lazy" />
                ) : (
                  <span className="gallery-placeholder" aria-hidden="true">{component.name.charAt(0)}</span>
                )}
              </div>
              <div className="gallery-card-content">
                <span className="gallery-card-category">{component.category}</span>
                <div className="gallery-card-title-row">
                  <h2>{component.name}</h2>
                  <span aria-hidden="true">↗</span>
                </div>
                <p>{component.description}</p>
                <div className="gallery-card-badges">
                  {component.badges.map((badge) => <span key={badge}>{badge}</span>)}
                </div>
              </div>
            </SiteLink>
          ))}
        </div>
      )}
    </div>
  );
}
