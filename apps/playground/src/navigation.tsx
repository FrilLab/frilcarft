import { useEffect, useState } from "react";
import type { AnchorHTMLAttributes, MouseEvent } from "react";

export interface BrowserLocation {
  readonly pathname: string;
  readonly search: string;
}

/** Small client-side navigation shared by routes and Gallery query state. */
export function useLocation(): BrowserLocation {
  const [location, setLocation] = useState<BrowserLocation>(() =>
    typeof window === "undefined"
      ? { pathname: "/", search: "" }
      : { pathname: window.location.pathname, search: window.location.search },
  );

  useEffect(() => {
    const handleLocationChange = () => setLocation({
      pathname: window.location.pathname,
      search: window.location.search,
    });
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("frilcraft:navigate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("frilcraft:navigate", handleLocationChange);
    };
  }, []);

  return location;
}

interface SiteLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export function SiteLink({ href, onClick, ...props }: SiteLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      (event.currentTarget.target && event.currentTarget.target !== "_self") ||
      event.currentTarget.hasAttribute("download")
    ) return;

    const destination = new URL(href, window.location.href);
    if (destination.origin !== window.location.origin) return;

    event.preventDefault();
    const next = destination.pathname + destination.search + destination.hash;
    const current = window.location.pathname + window.location.search + window.location.hash;
    if (next === current) return;

    window.history.pushState(null, "", next);
    window.dispatchEvent(new Event("frilcraft:navigate"));
    document.documentElement.scrollTop = 0;
  };

  return <a href={href} onClick={handleClick} {...props} />;
}
