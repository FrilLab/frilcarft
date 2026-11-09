/** Stable category IDs and their display labels for the Playground Gallery. */
export const componentCategories = {
  interaction: "Interaction",
  gallery: "Gallery",
  typography: "Typography",
  "3d": "3D",
} as const;

export type ComponentCategory = keyof typeof componentCategories;

/** Curated semantic tags. Extend this list when a registered component needs a new tag. */
export const componentTags = {
  reveal: "Reveal",
  invitation: "Invitation",
  animation: "Animation",
  click: "Click",
} as const;

export type ComponentTag = keyof typeof componentTags;

export function isComponentCategory(value: string): value is ComponentCategory {
  return Object.hasOwn(componentCategories, value);
}

export function isComponentTag(value: string): value is ComponentTag {
  return Object.hasOwn(componentTags, value);
}
