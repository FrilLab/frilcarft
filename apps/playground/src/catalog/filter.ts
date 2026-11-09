import { componentCategories, componentTags, isComponentCategory, isComponentTag } from "./metadata.js";
import type { ComponentCatalogEntry } from "./types.js";

export type CategoryFilter = ComponentCatalogEntry["category"] | "all";

export interface GalleryFilters {
  readonly query: string;
  readonly category: CategoryFilter;
  readonly tags: readonly ComponentCatalogEntry["tags"][number][];
}

export interface CategoryOption {
  readonly id: CategoryFilter;
  readonly label: string;
}

/** Normalize user text consistently for URL parsing and in-memory matching. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Return only categories currently represented in the catalog, with All always first. */
export function getCategoryOptions(catalog: readonly ComponentCatalogEntry[]): readonly CategoryOption[] {
  const registered = new Set(catalog.map((entry) => entry.category));
  return [
    { id: "all", label: "All" },
    ...Object.entries(componentCategories)
      .filter(([id]) => registered.has(id as ComponentCatalogEntry["category"]))
      .map(([id, label]) => ({ id: id as ComponentCatalogEntry["category"], label })),
  ];
}

/** Return curated tag options that are actually used by registered components. */
export function getTagOptions(catalog: readonly ComponentCatalogEntry[]) {
  const registered = new Set(catalog.flatMap((entry) => entry.tags));
  return Object.entries(componentTags)
    .filter(([id]) => registered.has(id as ComponentCatalogEntry["tags"][number]))
    .map(([id, label]) => ({ id: id as ComponentCatalogEntry["tags"][number], label }));
}

/** Filter lightweight metadata only; this function never calls a detail loader. */
export function filterComponents(
  catalog: readonly ComponentCatalogEntry[],
  filters: GalleryFilters,
): readonly ComponentCatalogEntry[] {
  const terms = normalizeSearchText(filters.query).split(" ").filter(Boolean);

  return catalog.filter((entry) => {
    if (filters.category !== "all" && entry.category !== filters.category) return false;
    if (!filters.tags.every((tag) => entry.tags.includes(tag))) return false;

    if (terms.length === 0) return true;
    const categoryLabel = componentCategories[entry.category];
    const tagLabels = entry.tags.map((tag) => componentTags[tag]);
    const searchableText = normalizeSearchText([
      entry.name,
      entry.id,
      entry.description,
      entry.category,
      categoryLabel,
      ...entry.tags,
      ...tagLabels,
    ].join(" "));
    return terms.every((term) => searchableText.includes(term));
  });
}

export function parseGalleryFilters(search: string): GalleryFilters {
  const params = new URLSearchParams(search);
  const categoryValue = params.get("category") ?? "all";
  const tags = [...new Set(params.getAll("tag").filter(isComponentTag))];
  return {
    query: params.get("q") ?? "",
    category: categoryValue === "all" || !isComponentCategory(categoryValue) ? "all" : categoryValue,
    tags,
  };
}

export function serializeGalleryFilters(filters: GalleryFilters): string {
  const params = new URLSearchParams();
  const query = filters.query.trim();
  if (query) params.set("q", query);
  if (filters.category !== "all") params.set("category", filters.category);
  for (const tag of filters.tags) params.append("tag", tag);
  return params.toString();
}
