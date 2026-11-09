import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";
import { useEffect, useRef } from "react";
import { componentCatalog } from "./catalog/index.js";
import { filterComponents, getCategoryOptions, getTagOptions, parseGalleryFilters, serializeGalleryFilters } from "./catalog/filter.js";
import { componentCategories, componentTags } from "./catalog/metadata.js";
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

function ComponentCard({
  component,
  selectedTags,
  toggleTag,
}: {
  component: (typeof componentCatalog)[number];
  selectedTags: GalleryFilters["tags"];
  toggleTag: (tag: GalleryFilters["tags"][number]) => void;
}) {
  return (
    <article className="group flex min-w-0 flex-col border-b border-rule pb-6">
      <SiteLink
        className="block"
        href={`/components/${component.id}`}
        aria-label={`Explore ${component.name}`}
      >
        <div className="aspect-[1.48] overflow-hidden bg-[#efede7] transition-colors duration-300 group-hover:bg-[#e9e5dc]">
          {component.previewImage ? (
            <img className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" src={component.previewImage} alt="" loading="lazy" />
          ) : (
            <span className="grid h-full place-items-center font-display text-8xl text-[#bdb6a9]" aria-hidden="true">{component.name.charAt(0)}</span>
          )}
        </div>
        <div className="pt-5">
          <p className="text-[10px] uppercase tracking-[.16em] text-muted-foreground">{componentCategories[component.category]}</p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h3 className="font-display text-3xl tracking-[-.04em]">{component.name}</h3>
            <span className="pt-1 text-lg text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true">↗</span>
          </div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{component.description}</p>
        </div>
      </SiteLink>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex flex-wrap gap-2" aria-label={`${component.name} tags`}>
          {component.tags.map((tag) => (
            <Button
              key={tag}
              type="button"
              aria-pressed={selectedTags.includes(tag)}
              variant="outline"
              size="sm"
              className={cn(
                "h-7 rounded-full px-3 text-[10px] uppercase tracking-[.1em]",
                selectedTags.includes(tag) && "border-ink bg-ink text-paper hover:bg-ink/90 hover:text-paper",
              )}
              onClick={() => toggleTag(tag)}
            >
              {componentTags[tag]}
            </Button>
          ))}
        </div>
        <p className="flex flex-wrap gap-2" aria-label="Technology">
          {component.badges.map((badge) => <Badge variant="muted" key={badge}>{badge}</Badge>)}
        </p>
      </div>
    </article>
  );
}

/** Gallery cards and filters use static metadata; detail loaders stay untouched. */
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
    <div>
      <section className="mx-auto grid max-w-[1440px] grid-cols-1 items-end gap-8 px-5 py-20 sm:px-9 md:min-h-[430px] md:grid-cols-[1.2fr_.8fr] md:py-24 lg:px-14 lg:py-28" aria-labelledby="gallery-title">
        <div>
          <p className="mb-7 text-[10px] uppercase tracking-[.18em] text-muted-foreground">An interactive component collection</p>
          <h1 id="gallery-title" aria-label="Small details. Made to move." className="font-display text-[clamp(3.5rem,9vw,8.5rem)] leading-[.88] tracking-[-.075em]">
            Small details.<br /><span className="text-accent">Made to move.</span>
          </h1>
        </div>
        <p className="max-w-md pb-1 text-base leading-7 text-muted-foreground md:justify-self-end md:text-[17px]">
          A considered collection of expressive, reusable pieces for the web. Explore each one, make it yours, and take the code with you.
        </p>
      </section>

      <section className="border-y border-rule" aria-label="Find a component">
        <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-9 lg:px-14">
          <label className="sr-only" htmlFor="component-search">Find a component</label>
          <div className="flex max-w-2xl items-center gap-3 border-b border-ink/40 pb-3 focus-within:border-ink">
            <svg className="size-[18px] shrink-0 stroke-muted-foreground" aria-hidden="true" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" focusable="false">
              <circle cx="10.8" cy="10.8" r="6.6" /><path d="m16 16 4.2 4.2" />
            </svg>
            <Input
              className="h-auto min-w-0 flex-1 rounded-none border-0 px-0 py-0 focus-visible:border-0 focus-visible:ring-0"
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
              <Button variant="link" size="sm" className="text-[10px] uppercase tracking-[.13em] text-muted-foreground" aria-label="Clear search" onClick={() => setFilters({ ...filters, query: "" })}>
                Clear
              </Button>
            )}
          </div>

          <nav className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-b border-rule" aria-label="Component categories">
            {categories.map((category) => (
              <Button
                key={category.id}
                type="button"
                aria-pressed={filters.category === category.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "-mb-px h-auto rounded-none border-0 border-b-2 px-0.5 pb-3 text-xs hover:bg-transparent",
                  filters.category === category.id ? "border-ink text-ink" : "border-transparent text-muted-foreground",
                )}
                onClick={() => setFilters({ ...filters, category: category.id })}
              >
                {category.label}
              </Button>
            ))}
          </nav>

          {tags.length > 0 && (
            <fieldset className="mt-5 border-0 p-0">
              <legend className="mb-3 text-[10px] uppercase tracking-[.15em] text-muted-foreground">Explore by detail</legend>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Button
                    key={tag.id}
                    type="button"
                    aria-pressed={filters.tags.includes(tag.id)}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-7 rounded-full px-3 text-[10px] uppercase tracking-[.1em]",
                      filters.tags.includes(tag.id) && "border-ink bg-ink text-paper hover:bg-ink/90 hover:text-paper",
                    )}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.label}
                  </Button>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-9 sm:py-16 lg:px-14" aria-labelledby="collection-title">
        <div className="mb-7 flex items-baseline justify-between gap-4">
          <h2 id="collection-title" className="font-display text-3xl tracking-[-.045em] sm:text-4xl">The collection</h2>
          <p className="text-[11px] text-muted-foreground" role="status" aria-live="polite">
            {visibleComponents.length} {visibleComponents.length === 1 ? "component" : "components"}
          </p>
        </div>

        {visibleComponents.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:gap-x-10 lg:gap-y-14" aria-label="Component gallery">
            {visibleComponents.map((component) => (
              <ComponentCard key={component.id} component={component} selectedTags={filters.tags} toggleTag={toggleTag} />
            ))}
          </div>
        ) : componentCatalog.length === 0 ? (
          <p className="border-t border-rule py-12 text-sm text-muted-foreground">The collection is being prepared. Check back soon.</p>
        ) : (
          <div className="border-t border-rule py-12" role="status">
            <h3 className="font-display text-3xl tracking-[-.04em]">No components found</h3>
            <p className="mt-3 text-sm text-muted-foreground">Try another search or clear your filters to see the full collection.</p>
            <Button className="mt-5" variant="link" onClick={() => setFilters({ query: "", category: "all", tags: [] })}>
              Clear all filters
            </Button>
          </div>
        )}
        {hasActiveFilters && visibleComponents.length > 0 && (
          <Button className="mt-8" variant="link" size="sm" onClick={() => setFilters({ query: "", category: "all", tags: [] })}>
            Clear all filters
          </Button>
        )}
      </section>
    </div>
  );
}
