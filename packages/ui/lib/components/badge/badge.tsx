import { cva, cx, type VariantProps } from "class-variance-authority";
import React, { forwardRef } from "react";

import { Icon, type IconType } from "../icon/icon";

const badgeVariants = cva(
  "flex flex-row items-center justify-center px-2 py-0.5 rounded-[var(--radius-lg)] shrink-0 relative font-medium text-center whitespace-nowrap border",
  {
    variants: {
      type: {
        default:
          "bg-gray-300 text-dark",
        success:
          "bg-green-200 text-white",
        error:
          "bg-red-200 text-white",
        warning: "bg-yellow-300 text-yellow-100",
        blue: "bg-blue-200 text-white",
        outline: "bg-transparent text-dark",
        dotted:
          "bg-transparent text-dark border-neutral-gray/30 border-dashed",
      },
      size: {
        sm: "text-[0.625rem]/[0.875rem] gap-0.5",
        md: "text-xs/[1.125rem] gap-1",
        lg: "px-3 py-1 text-sm/5 gap-1.5",
      },
    },
    defaultVariants: {
      type: "default",
      size: "md",
    },
  }
);

// Drop down badge sizes by a step for icons, else they are too large
const BadgeSizeToIconMap = {
  lg: "md",
  md: "base",
  sm: "xs",
} as const;

type BadgeProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof badgeVariants> & {
    label: string;
    iconLeft?: IconType;
    iconRight?: IconType;
  };

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, type, size, label, iconLeft, iconRight, ...props }, ref) => (
    <span
      ref={ref}
      className={cx(badgeVariants({ type, size, className }))}
      {...props}
    >
      {iconLeft && (
        <Icon type={iconLeft} size={BadgeSizeToIconMap[size || "md"]} />
      )}
      <span>{label}</span>
      {iconRight && (
        <Icon type={iconRight} className={BadgeSizeToIconMap[size || "md"]} />
      )}
    </span>
  )
);
