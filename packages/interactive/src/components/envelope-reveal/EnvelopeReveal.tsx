import { useId, useState } from "react";
import type { CSSProperties } from "react";

export interface EnvelopeRevealProps {
  title?: string;
  message?: string;
  eyebrow?: string;
  envelopeColor?: string;
  accentColor?: string;
  paperColor?: string;
  initiallyOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

const defaults = {
  title: "You're invited",
  message: "A little something, just for you.",
  eyebrow: "A LETTER FOR YOU",
  envelopeColor: "#d9bda7",
  accentColor: "#966d78",
  paperColor: "#fffdf8",
} as const;

/** An accessible, CSS-animated envelope that reveals a customizable letter. */
export function EnvelopeReveal({
  title = defaults.title,
  message = defaults.message,
  eyebrow = defaults.eyebrow,
  envelopeColor = defaults.envelopeColor,
  accentColor = defaults.accentColor,
  paperColor = defaults.paperColor,
  initiallyOpen = false,
  onOpenChange,
  className,
  style,
}: EnvelopeRevealProps) {
  const letterId = useId();
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const componentStyle = {
    ...style,
    "--fc-envelope-color": envelopeColor,
    "--fc-envelope-accent": accentColor,
    "--fc-envelope-paper": paperColor,
  } as CSSProperties;

  return (
    <div
      className={className ? `fc-envelope ${className}` : "fc-envelope"}
      data-state={isOpen ? "open" : "closed"}
      style={componentStyle}
    >
      <button
        className="fc-envelope__trigger"
        type="button"
        aria-controls={letterId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close the letter" : "Open the letter"}
        onClick={handleToggle}
      >
        <span className="fc-envelope__back" aria-hidden="true" />
        <span className="fc-envelope__paper" aria-hidden="true">
          <span className="fc-envelope__eyebrow">{eyebrow}</span>
          <span className="fc-envelope__title">{title}</span>
          <span className="fc-envelope__message">{message}</span>
        </span>
        <span className="fc-envelope__pocket" aria-hidden="true" />
        <span className="fc-envelope__flap" aria-hidden="true" />
        <span className="fc-envelope__seal" aria-hidden="true">F</span>
      </button>
      <p className="fc-envelope__hint" aria-hidden="true">
        {isOpen ? "Tap to close" : "Tap to open"}
      </p>
      <div
        className="fc-envelope__screen-reader"
        id={letterId}
        role="region"
        aria-label="Letter contents"
        hidden={!isOpen}
      >
        {[eyebrow, title, message].filter(Boolean).join(". ")}
      </div>
    </div>
  );
}
