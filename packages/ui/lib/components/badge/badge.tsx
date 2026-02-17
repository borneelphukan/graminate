import { cva, cx, type VariantProps } from "class-variance-authority";
import React, { forwardRef } from "react";

import { Icon, type IconType } from "../icon/icon";

const badgeVariants = cva(
  "flex flex-row items-center justify-center px-2 py-0.5 rounded-lg shrink-0 relative font-medium text-center whitespace-nowrap border",
  {
    variants: {
      type: {
        default:
          "bg-neutral-gray/10 text-neutral-black border-neutral-black/20",
        success: "bg-[#F0FDF4] text-[#039855] border-black/10 rounded-md",
        error: "bg-[#FEF3F2] text-[#B42318] border-black/10 rounded-md",
        warning: "bg-yellow-200/10 text-yellow-400 border-black/10",
        blue: "bg-blue-200/10 text-blue-400 border-blue-400/20",
        outline: "bg-transparent text-neutral-black border-neutral-gray/20",
        dotted:
          "bg-transparent text-neutral-black border-neutral-gray/30 border-dashed",
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
