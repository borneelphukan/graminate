import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils.ts";
import React, { forwardRef } from "react";

const layoutVariants = cva("flex self-stretch", {
  variants: {
    variant: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
    size: {
      lg: "gap-5",
      md: "gap-3",
    },
  },
  defaultVariants: {
    variant: "vertical",
    size: "md",
  },
});

type LayoutProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof layoutVariants>;

const Layout = forwardRef<HTMLDivElement, LayoutProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(layoutVariants({ variant, className }))}
      {...props}
    />
  )
);

export { Layout };
