// Tremor Badge [v0.0.1]

import React from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cx } from "@workspace/ui/lib/utils";

const badgeVariants = tv({
  base: cx(
    "inline-flex items-center gap-x-1 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold capitalize"
  ),
  variants: {
    variant: {
      default: ["bg-primary/10 text-primary ring-blue-400/30"],
      neutral: [
        "bg-gray-200 text-gray-900 ring-gray-400/30",
        "dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
      ],
      success: ["bg-emerald-400/10 text-emerald-400 ring-emerald-600/30"],
      error: ["bg-red-400/10 text-red-400 ring-red-600/20"],
      destructive: ["bg-red-400/10 text-red-400 ring-red-600/20"],
      warning: ["bg-yellow-400/10 text-yellow-400 ring-yellow-600/30"],
      info: ["bg-blue-400/10 text-blue-400 ring-sky-600/30"],
      secondary: ["bg-gray-400/10 text-gray-400 ring-gray-400/30"],
      dark: ["bg-gray-900 text-gray-100 ring-gray-950/30"],
      outline: "text-foreground border border-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface BadgeProps
  extends React.ComponentPropsWithoutRef<"span">,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }: BadgeProps, forwardedRef) => {
    return (
      <span
        ref={forwardedRef}
        className={cx(badgeVariants({ variant }), className)}
        tremor-id="tremor-raw"
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants, type BadgeProps };
