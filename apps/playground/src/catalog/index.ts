import type { ComponentCatalogEntry } from "./types.js";

/** Lightweight metadata used by the gallery and route lookup. */
export const componentCatalog: readonly ComponentCatalogEntry[] = [
  {
    id: "envelope-reveal",
    name: "Envelope Reveal",
    description: "A letter animation built with React and CSS.",
    category: "Interactive",
    badges: ["React", "CSS motion"],
    installable: true,
    previewImage: "/previews/envelope-reveal.svg",
    load: async () => (await import("./entries/envelope-reveal.js")).componentDetail,
  },
];

export type { ComponentCatalogEntry, ComponentDetailRegistration, PlaygroundProps, PlaygroundValue, SourceFile } from "./types.js";
