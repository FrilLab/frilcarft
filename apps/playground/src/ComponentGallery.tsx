import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { componentCatalog } from "./catalog/index.js";
import { filterComponents, getCategoryOptions, getTagOptions, parseGalleryFilters, serializeGalleryFilters } from "./catalog/filter.js";
import { componentTags } from "./catalog/metadata.js";
import type { GalleryFilters } from "./catalog/filter.js";
import { SiteLink } from "./navigation.js";

function updateGalleryUrl(filters: GalleryFilters, mode: "push" | "replace") {
  const query = serializeGalleryFilters(filters);
  const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === current) return;
  window.history[mode === "push" ? "pushState" : "replaceState"](null, "", next);
  window.dispatchEvent(new Event("frilcraft:navigate"));
}

/** The Gallery renders static artwork and catalog metadata without loading detail modules. */
export function ComponentGallery({ search }: { search: string }) {
  const filters = parseGalleryFilters(search);
  const categories = getCategoryOptions(componentCatalog);
  const tags = getTagOptions(componentCatalog);
  const visibleComponents = filterComponents(componentCatalog, filters);
  const searchSession = useRef(false);
  const hasActiveFilters = filters.query.trim().length > 0 || filters.category !== "all" || filters.tags.length > 0;

  useEffect(() => {
    const resetSearchSession = () => { searchSession.current = false; };
    window.addEventListener("popstate", resetSearchSession);
    return () => window.removeEventListener("popstate", resetSearchSession);
  }, []);

  const setFilters = (next: GalleryFilters, mode: "push" | "replace" = "push") => {
    searchSession.current = false;
    updateGalleryUrl(next, mode);
  };

  const updateSearch = (query: string) => {
    updateGalleryUrl({ ...filters, query }, searchSession.current ? "replace" : "push");
    searchSession.current = true;
  };

  const toggleTag = (tag: GalleryFilters["tags"][number]) => {
    const nextTags = filters.tags.includes(tag)
      ? filters.tags.filter((selected) => selected !== tag)
      : [...filters.tags, tag];
    setFilters({ ...filters, tags: nextTags });
  };

  return (
    <div className="page-content gallery-page">
      <section className="gallery-intro" aria-labelledby="gallery-title">
        <p className="eyebrow-label">An interactive component collection</p>
        <h1 id="gallery-title" aria-label="Small details. Made to move.">Small details.<br /><span>Made to move.</span></h1>
        <p className="gallery-description">A considered collection of expressive, reusable pieces for the web. Explore each one, make it yours, and take the code with you.</p>
      </section>

      <section className="discovery" aria-label="Find a component">
        <label className="search-label" htmlFor="component-search">Find a component</label>
        <div className="search-field">
          <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><circle cx="10.8" cy="10.8" r="6.6" /><path d="m16 16 4.2 4.2" /></svg>
          <input
            id="component-search"
            type="search"
            value={filters.query}
            placeholder="Search by name, category, or detail"
            onChange={(event) => updateSearch(event.target.value)}
            onFocus={() => { searchSession.current = false; }}
            onBlur={() => { searchSession.current = false; }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && filters.query) setFilters({ ...filters, query: "" });
            }}
          />
          {filters.query && (
            <button className="search-clear" type="button" aria-label="Clear search" onClick={() => setFilters({ ...filters, query: "" })}>
              Clear
            </button>
          )}
        </div>

        <nav className="category-navigation" aria-label="Component categories">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={filters.category === category.id}
              className={filters.category === category.id ? "is-selected" : ""}
              onClick={() => setFilters({ ...filters, category: category.id })}
            >
              {category.label}
            </button>
          ))}
        </nav>

        {tags.length > 0 && (
          <fieldset className="tag-filters">
            <legend>Explore by detail</legend>
            <div className="tag-filter-list">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={filters.tags.includes(tag.id)}
                  className={`tag-chip${filters.tags.includes(tag.id) ? " is-selected" : ""}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      </section>

      <section className="collection" aria-labelledby="collection-title">
        <div className="collection-heading">
          <h2 id="collection-title">The collection</h2>
          <p className="result-count" role="status" aria-live="polite">
            {visibleComponents.length} {visibleComponents.length === 1 ? "component" : "components"}
          </p>
        </div>

        {visibleComponents.length > 0 ? (
          <div className="gallery-grid" aria-label="Component gallery">
            {visibleComponents.map((component, index) => (
              <article className="gallery-card" key={component.id} style={{ "--card-index": index } as CSSProperties}>
                <SiteLink
                  href={`/components/${component.id}`}
                  className="gallery-card-main"
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
                    <span className="gallery-card-category">{categories.find(({ id }) => id === component.category)?.label}</span>
                    <div className="gallery-card-title-row">
                      <h3>{component.name}</h3>
                      <span className="card-arrow" aria-hidden="true">↗</span>
                    </div>
                    <p>{component.description}</p>
                  </div>
                </SiteLink>
                <div className="gallery-card-meta">
                  <div className="gallery-card-tags" aria-label={`${component.name} tags`}>
                    {component.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={filters.tags.includes(tag)}
                        className={`card-tag${filters.tags.includes(tag) ? " is-selected" : ""}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {componentTags[tag]}
                      </button>
                    ))}
                  </div>
                  <p className="gallery-card-badges" aria-label="Technology">
                    {component.badges.map((badge) => <span key={badge}>{badge}</span>)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : componentCatalog.length === 0 ? (
          <p className="gallery-empty">The collection is being prepared. Check back soon.</p>
        ) : (
          <div className="gallery-empty gallery-empty--filtered" role="status">
            <h3>No components found</h3>
            <p>Try another search or clear your filters to see the full collection.</p>
            <button type="button" className="clear-filters" onClick={() => setFilters({ query: "", category: "all", tags: [] })}>
              Clear all filters
            </button>
          </div>
        )}
        {hasActiveFilters && visibleComponents.length > 0 && (
          <button type="button" className="clear-filters clear-filters--inline" onClick={() => setFilters({ query: "", category: "all", tags: [] })}>
            Clear all filters
          </button>
        )}
      </section>

      <footer className="gallery-footer">
        <span>FrilCraft<span aria-hidden="true">.</span></span>
        <span>Interactive experiences, thoughtfully made.</span>
        <a href="https://github.com/FrilLab/frilcraft" target="_blank" rel="noreferrer">FrilCraft on GitHub <span aria-hidden="true">↗</span></a>
      </footer>
    </div>
  );
}
