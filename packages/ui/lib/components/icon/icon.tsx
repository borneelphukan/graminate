import { cva, type VariantProps } from "class-variance-authority";
import type { MaterialSymbol } from "material-symbols";
import { forwardRef } from "react";
import { cn } from "../../utils";

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

type IconProps = Omit<React.ComponentPropsWithoutRef<"i">, "color"> &
  Omit<VariantProps<typeof iconVariants>, "color" | "size"> & {
    type?: IconType | any;
    color?: VariantProps<typeof iconVariants>["color"] | (string & {});
    size?: VariantProps<typeof iconVariants>["size"] | number;
  };

const Icon = forwardRef<HTMLElement, IconProps>(
  ({ type, color, size, className, ...props }, ref) => {
    return (
      <i
        ref={ref}
        className={cn(
          iconVariants({ color: color as any, size: size as any, className }),
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
