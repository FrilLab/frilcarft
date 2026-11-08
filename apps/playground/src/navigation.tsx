import { useEffect, useState } from "react";
import type { AnchorHTMLAttributes, MouseEvent } from "react";

/** Small client-side navigation for the two Playground page types. */
export function usePathname(): string {
  const [pathname, setPathname] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname,
  );

  useEffect(() => {
    const handleLocationChange = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  return pathname;
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
    window.dispatchEvent(new PopStateEvent("popstate"));
    document.documentElement.scrollTop = 0;
  };

  return <a href={href} onClick={handleClick} {...props} />;
}
