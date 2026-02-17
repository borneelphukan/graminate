import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils";
import { SpinnerCustom } from "../../components/spinner/spinner";
import { Icon, type IconType } from "../icon/icon";

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
    icon?: {
      left?: IconType;
      right?: IconType;
    };
    label?: string;
  };

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 h-fit whitespace-nowrap text-base font-medium transition-all disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus:!ring-[2px] focus:!ring-brand-mute-green focus:!ring-offset-2 focus-visible:!ring-[3px] focus-visible:!ring-[#149184] focus-visible:!ring-offset-2 aria-invalid:!ring-red-200 aria-invalid:border-destructive cursor-pointer ease-out",
  {
    variants: {
      variant: {
        primary: "text-neutral-white btn-primary",
        success:
          "text-neutral-white bg-gradient-to-b from-green-200 via-green-300 to-green-400 bg-size-[200%_200%] bg-position-[center_-2px] hover:bg-bottom shadow-button border border-solid border-[oklch(var(--neutral-dark-gray)_/_12%)] box-border",
        destructive:
          "text-neutral-white bg-gradient-to-b from-red-200 via-red-300 to-red-400 bg-size-[200%_200%] bg-position-[center_-2px] hover:bg-bottom shadow-button border border-solid border-[oklch(var(--neutral-dark-gray)_/_12%)] box-border focus:!ring-red-200 focus-visible:!ring-red-200",
        outline:
          "text-foreground border border-dashed border-[oklch(var(--neutral-dark-gray)_/_30%)] shadow-[0_1px_2px_0_oklch(var(--neutral-overlay)_/_10%)]",
        secondary:
          "text-foreground btn-secondary border border-solid border-[oklch(var(--neutral-dark-gray)_/_12%)] shadow-button",
        ghost: "focus:shadow-[0_1px_2px_0_oklch(var(--neutral-overlay)_/_10%)]",
        link: "text-primary p-0 rounded-none border-solid border-transparent border hover:border-black/80",
      },
      size: {
        md: "py-1.5 px-3",
        sm: "py-0.5 px-2 text-sm",
        lg: "py-2 px-4",
        icon: "size-9",
      },
      shape: {
        default: "rounded-md",
        circle: "rounded-full",
      },
      isIconOnly: {
        true: "aspect-square",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  shape,
  icon,
  isLoading = false,
  asChild = false,
  label,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const isEffectivelyDisabled = isLoading || props.disabled;

  const hasText = !!label || !!children;
  const isIconOnly =
    size === "icon" || (!hasText && !!(icon?.left || icon?.right));

  const buttonProps: React.ComponentProps<"button"> = { ...props };
  if (isIconOnly && label && !buttonProps["aria-label"]) {
    buttonProps["aria-label"] = label;
  }

  const renderButtonContent = () => {
    return (
      <>
        {icon?.left && <Icon type={icon.left} />}
        {isIconOnly ? children : label || children}
        {icon?.right && <Icon type={icon.right} />}
      </>
    );
  };

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          shape,
          isIconOnly,
          className,
        })
      )}
      disabled={isEffectivelyDisabled}
      {...buttonProps}
    >
      <div
        className={cn(
          "flex items-center justify-center gap-2 transition-opacity duration-200",
          isLoading && "opacity-0 pointer-events-none",
          isEffectivelyDisabled && !isLoading && "opacity-50"
        )}
      >
        {renderButtonContent()}
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <SpinnerCustom />
        </div>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
