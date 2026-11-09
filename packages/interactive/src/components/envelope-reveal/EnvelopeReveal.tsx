import { cn } from "cn";
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

// Geometry and animation values stay as static utilities so Tailwind can emit
// them for both workspace and copied-source consumers.
const styles = {
  root: `group relative mx-auto w-full max-w-[430px] text-center text-[#433b40]
    [font-family:Georgia,'Times_New_Roman',serif]`,
  trigger: `relative block aspect-[1.45] w-full cursor-pointer appearance-none border-0 bg-transparent p-0
    [-webkit-tap-highlight-color:transparent] [perspective:850px]
    focus-visible:rounded-[9px] focus-visible:outline focus-visible:outline-[3px]
    focus-visible:outline-offset-[7px] focus-visible:outline-[var(--fc-envelope-accent)]`,
  back: `absolute inset-[34%_4%_9%] rounded-[5px_5px_11px_11px]
    bg-[var(--fc-envelope-color)]
    shadow-[0_24px_38px_-19px_rgb(55_35_37_/_34%),0_2px_5px_rgb(60_35_40_/_14%)]`,
  paper: `absolute inset-[27%_12%_22%] z-[2] flex flex-col items-center justify-center gap-2
    overflow-hidden rounded-[4px] border border-[rgb(75_45_45_/_7%)]
    bg-[var(--fc-envelope-paper)] p-4 shadow-[0_1px_9px_rgb(70_43_39_/_10%)]
    [transform:translateY(25%)_scale(.96)] [will-change:transform]
    transition-[transform,box-shadow] duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)]
    group-data-[state=open]:[transform:translateY(-40%)_scale(1.02)]
    group-data-[state=open]:shadow-[0_15px_28px_rgb(60_35_40_/_13%)]
    group-data-[state=open]:delay-[330ms]
    motion-reduce:transition-none motion-reduce:delay-0 motion-reduce:[will-change:auto]`,
  eyebrow: `block text-[var(--fc-envelope-accent)]
    [font:600_clamp(7px,1.9vw,10px)/1.4_system-ui,sans-serif] tracking-[.2em]`,
  title: `block [font-size:clamp(19px,5vw,29px)] [line-height:1.12] font-normal`,
  message: `block max-w-[22ch] text-[#746b6a]
    [font:400_clamp(9px,2vw,12px)/1.55_system-ui,sans-serif]`,
  pocket: `absolute inset-[34%_4%_9%] z-[3] overflow-hidden rounded-b-[11px]
    bg-[color-mix(in_srgb,var(--fc-envelope-color)_88%,white)]
    [clip-path:polygon(0_0,50%_48%,100%_0,100%_100%,0_100%)]
    after:absolute after:inset-0
    after:bg-[linear-gradient(115deg,rgb(255_255_255_/_20%),transparent_54%)]
    after:content-[''] after:[clip-path:polygon(0_0,50%_48%,100%_0,100%_100%,0_100%)]`,
  flap: `absolute left-[4%] top-[34%] z-[5] h-[33%] w-[92%] origin-top
    [transform:rotateX(0deg)] [backface-visibility:hidden]
    [clip-path:polygon(0_0,100%_0,50%_100%)]
    bg-[color-mix(in_srgb,var(--fc-envelope-color)_93%,white)]
    transition-transform duration-[700ms] ease-[cubic-bezier(.2,.7,.15,1)]
    group-data-[state=open]:[transform:rotateX(180deg)] motion-reduce:transition-none`,
  seal: `absolute left-1/2 top-[57%] z-[6] grid size-[43px] place-items-center rounded-full
    border-[3px] border-[rgb(255_255_255_/_20%)] bg-[var(--fc-envelope-accent)]
    text-[#ffe8e2] shadow-[0_3px_8px_rgb(59_23_37_/_23%),inset_0_0_0_1px_rgb(80_21_37_/_20%)]
    [transform:translate(-50%,-50%)] [font:italic_24px/1_Georgia,serif]
    transition-[transform,opacity] duration-[400ms] ease-in-out
    group-data-[state=open]:[transform:translate(-50%,-50%)_scale(.6)]
    group-data-[state=open]:opacity-0 group-data-[state=open]:pointer-events-none
    motion-reduce:transition-none`,
  hint: `m-0 mt-1 text-[#827679] [font:500_11px/1.5_system-ui,sans-serif]
    tracking-[.14em] uppercase`,
} as const;

/** An accessible envelope that opens to reveal a customizable letter. */
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
      className={cn(styles.root, className)}
      data-component="envelope-reveal"
      data-state={isOpen ? "open" : "closed"}
      style={componentStyle}
    >
      <button
        className={styles.trigger}
        type="button"
        aria-controls={letterId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close the letter" : "Open the letter"}
        onClick={handleToggle}
      >
        <span className={styles.back} aria-hidden="true" />
        <span className={styles.paper} aria-hidden="true">
          <span className={styles.eyebrow}>{eyebrow}</span>
          <span className={styles.title}>{title}</span>
          <span className={styles.message}>{message}</span>
        </span>
        <span className={styles.pocket} aria-hidden="true" />
        <span className={styles.flap} aria-hidden="true" />
        <span className={styles.seal} aria-hidden="true">F</span>
      </button>
      <p className={styles.hint} aria-hidden="true">
        {isOpen ? "Tap to close" : "Tap to open"}
      </p>
      <div
        className={isOpen ? "sr-only" : "hidden"}
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
