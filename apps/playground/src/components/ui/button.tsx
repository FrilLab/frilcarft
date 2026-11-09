import type { ComponentProps } from "react";
import { cn } from "cn";

type ButtonVariant = "default" | "outline" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "icon";

const variants: Record<ButtonVariant, string> = {
  default: "border border-ink bg-ink text-paper hover:bg-ink/90",
  outline: "border border-rule bg-transparent hover:border-ink hover:bg-ink hover:text-paper",
  ghost: "border border-transparent bg-transparent text-muted-foreground hover:text-foreground",
  link: "border-0 bg-transparent px-0 text-ink underline underline-offset-4 hover:text-accent",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-9 px-3 text-xs",
  sm: "h-8 px-2.5 text-[11px]",
  icon: "size-8 p-0 text-xs",
};

function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}

export { Button };
