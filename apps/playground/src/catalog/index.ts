import type { ComponentCatalogEntry } from "./types.js";

/** Lightweight metadata used by the gallery and route lookup. */
export const componentCatalog: readonly ComponentCatalogEntry[] = [
  {
    id: "envelope-reveal",
    name: "Envelope Reveal",
    description: "An invitation letter that unfolds with a soft, paper-like motion.",
    category: "interaction",
    tags: ["reveal", "invitation", "animation", "click"],
    badges: ["React", "Tailwind"],
    installable: true,
    previewImage: "/previews/envelope-reveal.svg",
    load: async () => (await import("./entries/envelope-reveal.js")).componentDetail,
  },
];

export type { ComponentCategory, ComponentTag } from "./metadata.js";
export type { ComponentCatalogEntry, ComponentDetailRegistration, PlaygroundProps, PlaygroundValue, SourceFile } from "./types.js";
