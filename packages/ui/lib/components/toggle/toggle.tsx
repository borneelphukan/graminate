import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-accent border border-neutral-light-gray",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ToggleProps = Omit<
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
  "pressed" | "onPressedChange"
> &
  VariantProps<typeof toggleVariants> & {
    label: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
    onClick?: () => void;
  };

const Toggle = React.forwardRef<
  React.ComponentRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(
  (
    {
      className,
      label,
      description,
      icon,
      isActive = false,
      onClick,
      variant,
      size,
      ...props
    },
    ref
  ) => {
    if (description || icon) {
      return (
        <TogglePrimitive.Root
          ref={ref}
          data-slot="toggle-card"
          pressed={isActive}
          onPressedChange={onClick}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border p-2 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
            isActive
              ? "bg-accent border-[#149184]"
              : "bg-card border-neutral-light-gray",
            className
          )}
          {...props}
        >
          {icon && (
            <div
              className={cn(
                "flex-shrink-0 rounded-md p-2",
                isActive ? "bg-white" : "bg-accent"
              )}
            >
              <span className="material-symbols-outlined text-foreground text-[20px]">
                {icon}
              </span>
            </div>
          )}
          <div className="text-left flex-1 min-w-0">
            <div className="text-sm text-card-foreground break-words hyphens-auto">
              {label}
            </div>
            {description && (
              <div className="text-xs text-muted-foreground">{description}</div>
            )}
          </div>
        </TogglePrimitive.Root>
      );
    }

    return (
      <TogglePrimitive.Root
        ref={ref}
        data-slot="toggle-button"
        pressed={isActive}
        onPressedChange={onClick}
        className={cn(
          toggleVariants({ variant, size, className }),
          isActive ? "ring-1 border-transparent" : "border-neutral-light-gray"
        )}
        {...props}
      >
        <span>{label}</span>
      </TogglePrimitive.Root>
    );
  }
);

export { Toggle, toggleVariants };
