import { cva, type VariantProps } from "class-variance-authority";
import type { MaterialSymbol } from "material-symbols";
import { forwardRef } from "react";
import { cn } from "../../utils.ts";

export type IconType = MaterialSymbol;

const iconVariants = cva("material-symbols-outlined leading-none", {
  variants: {
    color: {
      primary: "text-brand-green",
      secondary: "text-brand-tech-green",
    },
    size: {
      lg: "text-xl!",
      md: "text-lg!",
      base: "text-base!",
      sm: "text-sm!",
      xs: "text-xs!",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type IconProps = React.ComponentPropsWithoutRef<"i"> &
  VariantProps<typeof iconVariants> & {
    type: IconType;
  };

const Icon = forwardRef<HTMLElement, IconProps>(
  ({ type, color, size, className, ...props }, ref) => {
    return (
      <i
        ref={ref}
        className={cn(
          iconVariants({ color, size, className }),
          props.onClick && "cursor-pointer"
        )}
        {...props}
      >
        {type}
      </i>
    );
  }
);

export { Icon };
