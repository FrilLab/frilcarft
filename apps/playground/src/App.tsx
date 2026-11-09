import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "cn";
import { componentCatalog } from "./catalog/index.js";
import { ComponentDetail } from "./ComponentDetail.js";
import { ComponentGallery } from "./ComponentGallery.js";
import { SiteLink, useLocation } from "./navigation.js";

/** App owns the site shell and URL routing. */
function App() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const onGallery = segments.length === 0;
  const selectedComponent = segments.length === 2 && segments[0] === "components"
    ? componentCatalog.find((component) => component.id === segments[1])
    : undefined;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-paper text-ink">
        <header className="border-b border-rule">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-9 lg:px-14">
            <SiteLink
              className="font-display text-[1.45rem] leading-none tracking-[-.06em]"
              href="/"
              aria-label="FrilCraft home"
            >
              FrilCraft<span className="text-accent" aria-hidden="true">.</span>
            </SiteLink>
            <nav className="flex items-center gap-6 text-[11px] uppercase tracking-[.14em] text-muted-foreground sm:gap-9" aria-label="Main navigation">
              <SiteLink className={cn("transition-colors hover:text-ink", onGallery && "text-ink")} href="/" aria-current={onGallery ? "page" : undefined}>
                Components
              </SiteLink>
              <a className="transition-colors hover:text-ink" href="https://github.com/FrilLab/frilcraft" target="_blank" rel="noreferrer">
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </nav>
          </div>
        </header>

        <main id="top">
          {onGallery ? (
            <ComponentGallery search={location.search} />
          ) : selectedComponent ? (
            <ComponentDetail key={selectedComponent.id} selectedComponent={selectedComponent} />
          ) : (
            <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-9 lg:px-14 lg:py-36">
              <p className="mb-5 text-[10px] uppercase tracking-[.18em] text-muted-foreground">Not found</p>
              <h1 className="font-display text-5xl tracking-[-.05em] sm:text-7xl">Component not found.</h1>
              <p className="mt-5 max-w-lg text-muted-foreground">The requested component is not registered in this Playground.</p>
              <SiteLink className="mt-8 inline-flex border-b border-ink pb-1 text-sm" href="/">Back to all components</SiteLink>
            </div>
          )}
        </main>
        <footer className="border-t border-rule">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-6 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-9 lg:px-14">
            <span>FrilCraft<span aria-hidden="true">.</span> · Interactive experiences, thoughtfully made.</span>
            <span>{componentCatalog.length} {componentCatalog.length === 1 ? "component" : "components"} in the collection</span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default App;
