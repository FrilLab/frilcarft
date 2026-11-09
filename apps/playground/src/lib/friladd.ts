export const FRILADD_VERSION = "latest" as const;
export const FRILADD_REGISTRY_ALIAS = "frilcraft" as const;
export const FRILCRAFT_REGISTRY_URL = "https://raw.githubusercontent.com/FrilLab/frilcraft/main/registry.json" as const;

const COMPONENT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateComponentId(componentId: string): string {
  if (!COMPONENT_ID_PATTERN.test(componentId)) {
    throw new TypeError(`Unsafe FrilAdd component identifier: ${componentId}`);
  }
  return componentId;
}

export function createFrilAddRegistrationCommand(): string {
  return `npx --yes friladd@${FRILADD_VERSION} registry add ${FRILADD_REGISTRY_ALIAS} ${FRILCRAFT_REGISTRY_URL} --global --default`;
}

export function createFrilAddComponentCommand(componentId: string): string {
  return `npx --yes friladd@${FRILADD_VERSION} add ${validateComponentId(componentId)}`;
}

export function createFrilAddQualifiedComponentCommand(componentId: string): string {
  return `npx --yes friladd@${FRILADD_VERSION} add ${FRILADD_REGISTRY_ALIAS}/${validateComponentId(componentId)}`;
}

export function createFrilAddUrlComponentCommand(componentId: string): string {
  return `npx --yes friladd@${FRILADD_VERSION} add ${validateComponentId(componentId)} --registry ${FRILCRAFT_REGISTRY_URL}`;
}
