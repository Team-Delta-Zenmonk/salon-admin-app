import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground border border-border",
        active:
          "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
        trial:
          "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
        expired:
          "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
        suspended:
          "bg-zinc-100 text-zinc-500 border border-zinc-300 line-through dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800",
        info: "bg-primary/10 text-primary border border-primary/20",
        outline: "border border-border text-foreground bg-transparent",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  withDot = false,
  children,
  ...props
}) => {
  const getDotColor = () => {
    switch (variant) {
      case "active":
        return "bg-emerald-500";
      case "trial":
        return "bg-amber-500";
      case "expired":
        return "bg-rose-500";
      case "suspended":
        return "bg-zinc-400";
      case "info":
        return "bg-primary";
      default:
        return "bg-muted-foreground";
    }
  };

  return (
    <div className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {withDot && <span className={cn("h-1.5 w-1.5 rounded-full", getDotColor())} />}
      {children}
    </div>
  );
};
