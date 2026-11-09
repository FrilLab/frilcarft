import { describe, expect, it, vi } from "vitest";
import { componentCatalog } from "./index.js";
import { filterComponents, getCategoryOptions, getTagOptions, normalizeSearchText, parseGalleryFilters, serializeGalleryFilters } from "./filter.js";
import { componentCategories, componentTags, isComponentCategory, isComponentTag } from "./metadata.js";
import type { ComponentCatalogEntry } from "./types.js";

function entry(overrides: Partial<ComponentCatalogEntry> & Pick<ComponentCatalogEntry, "id" | "name">): ComponentCatalogEntry {
  return {
    id: overrides.id,
    name: overrides.name,
    description: overrides.description ?? `${overrides.name} interaction for printed invitations`,
    category: overrides.category ?? "interaction",
    tags: overrides.tags ?? ["reveal", "invitation"],
    badges: overrides.badges ?? ["React", "CSS"],
    installable: overrides.installable ?? false,
    load: overrides.load ?? vi.fn(),
    ...(overrides.previewImage ? { previewImage: overrides.previewImage } : {}),
  };
}

const sampleCatalog = [
  entry({ id: "envelope-reveal", name: "Envelope Reveal", category: "interaction", tags: ["reveal", "invitation", "animation"] }),
  entry({ id: "type-specimen", name: "Type Specimen", description: "A typographic display for editorial text.", category: "typography", tags: ["animation"] }),
  entry({ id: "image-wall", name: "Image Wall", description: "A still image collection.", category: "gallery", tags: ["click"] }),
];

describe("catalog metadata and filtering", () => {
  it("uses only stable category IDs and curated tag IDs", () => {
    for (const component of componentCatalog) {
      expect(isComponentCategory(component.category)).toBe(true);
      expect(component.category in componentCategories).toBe(true);
      expect(component.tags.length).toBeGreaterThan(0);
      expect(new Set(component.tags).size).toBe(component.tags.length);
      for (const tag of component.tags) {
        expect(isComponentTag(tag)).toBe(true);
        expect(tag in componentTags).toBe(true);
      }
    }
    expect(componentCatalog[0]).toMatchObject({
      category: "interaction",
      tags: ["reveal", "invitation", "animation", "click"],
      badges: ["React", "CSS"],
    });
  });

  it("searches names, IDs, descriptions, category names, and tag names without loading details", () => {
    const cases = [
      ["envelope", "envelope-reveal"],
      ["type-specimen", "type-specimen"],
      ["printed invitations", "envelope-reveal"],
      ["Typography", "type-specimen"],
      ["reveal", "envelope-reveal"],
    ] as const;
    for (const [query, expectedId] of cases) {
      expect(filterComponents(sampleCatalog, { query, category: "all", tags: [] }).map(({ id }) => id)).toContain(expectedId);
    }
    expect(normalizeSearchText("  ÉNVELOPE   REVEAL ")).toBe("envelope reveal");
    for (const { load } of sampleCatalog) expect(load).not.toHaveBeenCalled();
  });

  it("combines query, category, and selected tags with AND matching", () => {
    expect(filterComponents(sampleCatalog, {
      query: "invitation",
      category: "interaction",
      tags: ["reveal", "animation"],
    }).map(({ id }) => id)).toEqual(["envelope-reveal"]);

    expect(filterComponents(sampleCatalog, {
      query: "invitation",
      category: "gallery",
      tags: ["reveal"],
    })).toEqual([]);
  });

  it("requires every selected tag and handles an empty result", () => {
    expect(filterComponents(sampleCatalog, { query: "", category: "all", tags: ["reveal", "animation"] }))
      .toHaveLength(1);
    expect(filterComponents(sampleCatalog, { query: "", category: "all", tags: ["reveal", "click"] }))
      .toEqual([]);
    expect(filterComponents(sampleCatalog, { query: "missing", category: "all", tags: [] })).toEqual([]);
  });

  it("generates only categories and tags represented by the registered catalog", () => {
    expect(getCategoryOptions([sampleCatalog[0]!])).toEqual([
      { id: "all", label: "All" },
      { id: "interaction", label: "Interaction" },
    ]);
    expect(getTagOptions([sampleCatalog[0]!])).toEqual([
      { id: "reveal", label: "Reveal" },
      { id: "invitation", label: "Invitation" },
      { id: "animation", label: "Animation" },
    ]);
    expect(getCategoryOptions([])).toEqual([{ id: "all", label: "All" }]);
  });

  it("round trips shareable search, category, and repeated tag parameters", () => {
    const filters = { query: "  Envelope Reveal  ", category: "interaction" as const, tags: ["reveal" as const, "click" as const] };
    const serialized = serializeGalleryFilters(filters);
    expect(serialized).toBe("q=++Envelope+Reveal++&category=interaction&tag=reveal&tag=click");
    expect(parseGalleryFilters(`?${serialized}`)).toEqual({ query: "  Envelope Reveal  ", category: "interaction", tags: ["reveal", "click"] });
    expect(parseGalleryFilters("?category=unknown&tag=bad&tag=reveal")).toEqual({ query: "", category: "all", tags: ["reveal"] });
  });
});
