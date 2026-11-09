import type { ComponentProps } from "react";
import { cn } from "cn";

type BadgeVariant = "default" | "outline" | "muted";

const variants: Record<BadgeVariant, string> = {
  default: "border-ink bg-ink text-paper",
  outline: "border-rule text-muted-foreground",
  muted: "border-transparent bg-muted text-muted-foreground",
};

function Badge({
  className,
  variant = "default",
  ...props
}: ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(
        "inline-flex h-6 w-fit items-center justify-center rounded-sm border px-2 text-[10px] font-medium uppercase tracking-[.1em]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
