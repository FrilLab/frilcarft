/**
 * View registration is independent of a rendering backend.
 * The backend-specific Scene contract will be designed alongside the first
 * functioning Three.js renderer rather than generalized prematurely.
 */
export interface ViewSpec {
  readonly id: string;
  readonly element: HTMLElement;
}

export interface ViewRegistration {
  readonly id: string;
  readonly element: HTMLElement;
  readonly disposed: boolean;
  setVisible(visible: boolean): void;
  invalidate(): void;
  dispose(): void;
}

export interface ViewBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly pixelRatio: number;
}
