/**
 * Envelope Reveal — a DOM-only interaction implemented with native browser APIs.
 * No React, Three.js, Canvas, timers, or animation libraries are required.
 */
export interface EnvelopeRevealOptions {
  title?: string;
  message?: string;
  eyebrow?: string;
  envelopeColor?: string;
  accentColor?: string;
  paperColor?: string;
  initiallyOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface EnvelopeRevealHandle {
  readonly element: HTMLDivElement;
  readonly isOpen: boolean;
  setOpen(open: boolean): void;
  toggle(): void;
  setOptions(options: Partial<Omit<EnvelopeRevealOptions, "initiallyOpen">>): void;
  dispose(): void;
}

const defaults = {
  title: "You're invited",
  message: "A little something, just for you.",
  eyebrow: "A LETTER FOR YOU",
  envelopeColor: "#d9bda7",
  accentColor: "#966d78",
  paperColor: "#fffdf8",
} as const;

let nextId = 0;

/** Mount one independent envelope interaction into an existing HTMLElement. */
export function createEnvelopeReveal(
  host: HTMLElement,
  options: EnvelopeRevealOptions = {},
): EnvelopeRevealHandle {
  const doc = host.ownerDocument;
  const id = "fc-envelope-letter-" + ++nextId;
  const root = doc.createElement("div");
  root.className = "fc-envelope";
  root.dataset.state = options.initiallyOpen ? "open" : "closed";

  const trigger = doc.createElement("button");
  trigger.type = "button";
  trigger.className = "fc-envelope__trigger";
  trigger.setAttribute("aria-controls", id);

  const back = doc.createElement("span");
  back.className = "fc-envelope__back";
  back.setAttribute("aria-hidden", "true");

  const paper = doc.createElement("span");
  paper.className = "fc-envelope__paper";
  paper.setAttribute("aria-hidden", "true");

  const eyebrow = doc.createElement("span");
  eyebrow.className = "fc-envelope__eyebrow";
  const title = doc.createElement("span");
  title.className = "fc-envelope__title";
  const message = doc.createElement("span");
  message.className = "fc-envelope__message";
  paper.append(eyebrow, title, message);

  const pocket = doc.createElement("span");
  pocket.className = "fc-envelope__pocket";
  pocket.setAttribute("aria-hidden", "true");

  const flap = doc.createElement("span");
  flap.className = "fc-envelope__flap";
  flap.setAttribute("aria-hidden", "true");

  const seal = doc.createElement("span");
  seal.className = "fc-envelope__seal";
  seal.textContent = "F";
  seal.setAttribute("aria-hidden", "true");

  trigger.append(back, paper, pocket, flap, seal);

  const hint = doc.createElement("p");
  hint.className = "fc-envelope__hint";
  hint.setAttribute("aria-hidden", "true");

  // Make the opened letter accessible while avoiding nested interactive content.
  const accessibleLetter = doc.createElement("div");
  accessibleLetter.id = id;
  accessibleLetter.className = "fc-envelope__screen-reader";
  accessibleLetter.setAttribute("role", "region");
  accessibleLetter.setAttribute("aria-label", "Letter contents");

  root.append(trigger, hint, accessibleLetter);
  host.append(root);

  let disposed = false;
  let open = !!options.initiallyOpen;
  let onOpenChange = options.onOpenChange;

  const updateState = (): void => {
    root.dataset.state = open ? "open" : "closed";
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-label", open ? "Close the letter" : "Open the letter");
    hint.textContent = open ? "Tap to close" : "Tap to open";
    accessibleLetter.hidden = !open;
  };

  const setOpen = (next: boolean): void => {
    if (disposed || open === next) return;
    open = next;
    updateState();
    onOpenChange?.(open);
  };

  const setOptions = (
    next: Partial<Omit<EnvelopeRevealOptions, "initiallyOpen">>,
  ): void => {
    if (disposed) return;
    if (next.title !== undefined) title.textContent = next.title;
    if (next.message !== undefined) message.textContent = next.message;
    if (next.eyebrow !== undefined) eyebrow.textContent = next.eyebrow;
    if (next.envelopeColor !== undefined) {
      root.style.setProperty("--fc-envelope-color", next.envelopeColor);
    }
    if (next.accentColor !== undefined) {
      root.style.setProperty("--fc-envelope-accent", next.accentColor);
    }
    if (next.paperColor !== undefined) {
      root.style.setProperty("--fc-envelope-paper", next.paperColor);
    }
    if ("onOpenChange" in next) onOpenChange = next.onOpenChange;
    accessibleLetter.textContent = [eyebrow.textContent, title.textContent, message.textContent]
      .filter(Boolean)
      .join(". ");
  };

  const onClick = (): void => setOpen(!open);
  trigger.addEventListener("click", onClick);
  setOptions({ ...defaults, ...options });
  updateState();

  return {
    element: root,
    get isOpen() {
      return open;
    },
    setOpen,
    toggle: onClick,
    setOptions,
    dispose() {
      if (disposed) return;
      disposed = true;
      trigger.removeEventListener("click", onClick);
      root.remove();
    },
  };
}
