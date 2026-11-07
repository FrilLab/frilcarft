import type { ViewRegistration, ViewSpec } from "../view/types.js";

/**
 * Structural contract only. No Stage implementation is published yet.
 *
 * Exactly one GPU canvas and renderer may be owned by a Stage.
 * A Stage may host several Views; Views never allocate canvases.
 */
export interface StageOptions {
  readonly host: HTMLElement;
  readonly frameMode?: "demand" | "continuous";
}

export interface StageHandle {
  readonly host: HTMLElement;
  readonly canvas: HTMLCanvasElement;
  readonly disposed: boolean;
  addView(spec: ViewSpec): ViewRegistration;
  invalidate(): void;
  dispose(): void;
}
