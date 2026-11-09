import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { componentCatalog } from "../catalog.js";
import {
  FRILADD_REGISTRY_ALIAS,
  FRILADD_VERSION,
  createFrilAddComponentCommand,
  createFrilAddQualifiedComponentCommand,
  createFrilAddRegistrationCommand,
  createFrilAddUrlComponentCommand,
} from "./friladd.js";

describe("FrilAdd command generation", () => {
  it("uses the centralized latest tag in user-facing commands", () => {
    expect(FRILADD_VERSION).toBe("latest");
    expect(FRILADD_REGISTRY_ALIAS).toBe("frilcraft");
    expect(createFrilAddRegistrationCommand()).toBe(
      "npx --yes friladd@latest registry add frilcraft https://raw.githubusercontent.com/FrilLab/frilcraft/main/registry.json --global --default",
    );
    expect(createFrilAddComponentCommand("envelope-reveal")).toBe(
      "npx --yes friladd@latest add envelope-reveal",
    );
    expect(createFrilAddQualifiedComponentCommand("envelope-reveal")).toBe(
      "npx --yes friladd@latest add frilcraft/envelope-reveal",
    );
    expect(createFrilAddUrlComponentCommand("envelope-reveal")).toBe(
      "npx --yes friladd@latest add envelope-reveal --registry https://raw.githubusercontent.com/FrilLab/frilcraft/main/registry.json",
    );
  });

  it("rejects component IDs that are not safe shell tokens", () => {
    for (const id of ["../other", "envelope-reveal;echo-pwned", "Envelope-Reveal", "frilcraft/item"]) {
      expect(() => createFrilAddComponentCommand(id)).toThrow("Unsafe FrilAdd component identifier");
      expect(() => createFrilAddQualifiedComponentCommand(id)).toThrow("Unsafe FrilAdd component identifier");
    }
  });
});

describe("Playground and Registry IDs", () => {
  it("keeps every installable Playground registration aligned with registry.json", () => {
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), "registry.json"), "utf8")) as {
      items: Array<{ name: string }>;
    };
    const catalogIds = componentCatalog.filter(component => component.installable).map(({ id }) => id).sort();
    expect(catalogIds).toEqual(manifest.items.map(({ name }) => name).sort());
  });
});
