/**
 * Optional React adapter for the framework-independent Envelope Reveal engine.
 * Import envelope-reveal.css explicitly from the consuming application.
 */
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import {
  createEnvelopeReveal,
} from "../../components/dom/envelope-reveal/envelope-reveal.js";
import type {
  EnvelopeRevealHandle,
  EnvelopeRevealOptions,
} from "../../components/dom/envelope-reveal/envelope-reveal.js";

export interface EnvelopeRevealProps extends EnvelopeRevealOptions {
  className?: string;
  style?: CSSProperties;
}

export function EnvelopeReveal({
  className,
  style,
  initiallyOpen,
  title,
  message,
  eyebrow,
  envelopeColor,
  accentColor,
  paperColor,
  onOpenChange,
}: EnvelopeRevealProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<EnvelopeRevealHandle | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const instance = createEnvelopeReveal(host, {
      initiallyOpen,
      title,
      message,
      eyebrow,
      envelopeColor,
      accentColor,
      paperColor,
      onOpenChange,
    });
    instanceRef.current = instance;
    return () => {
      instanceRef.current = null;
      instance.dispose();
    };
    // initiallyOpen is intentionally read only when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    instanceRef.current?.setOptions({
      title: title ?? "You're invited",
      message: message ?? "A little something, just for you.",
      eyebrow: eyebrow ?? "A LETTER FOR YOU",
      envelopeColor: envelopeColor ?? "#d9bda7",
      accentColor: accentColor ?? "#966d78",
      paperColor: paperColor ?? "#fffdf8",
      onOpenChange,
    });
  }, [title, message, eyebrow, envelopeColor, accentColor, paperColor, onOpenChange]);

  return <div ref={hostRef} className={className} style={style} />;
}
