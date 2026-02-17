"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";
import { toggleVariants } from "../toggle/toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
});

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

type ToggleGroupItemProps = React.ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Item
> &
  VariantProps<typeof toggleVariants> & {
    label?: string;
    description?: string;
    icon?: string;
  };

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(
  (
    { className, children, variant, size, label, description, icon, ...props },
    ref
  ) => {
    const context = React.useContext(ToggleGroupContext);

    if (description || label) {
      return (
        <ToggleGroupPrimitive.Item
          ref={ref}
          data-slot="toggle-group-item"
          data-variant={context.variant || variant}
          data-size={context.size || size}
          className={cn(
            "flex flex-1 items-center gap-4 border border-neutral-light-gray p-3 text-left transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
            "data-[state=on]:bg-accent",
            "data-[state=off]:bg-card",
            "rounded-none first:rounded-l-md last:rounded-r-md",
            "border-l-0 first:border-l",
            "focus:z-10",
            className
          )}
          {...props}
        >
          {icon && (
            <div className="flex-shrink-0 rounded-md bg-gray-200 p-2">
              <span className="material-symbols-outlined text-foreground">
                {icon}
              </span>
            </div>
          )}
          <div className="text-left">
            <div className="text-base text-card-foreground">{label}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
          </div>
        </ToggleGroupPrimitive.Item>
      );
    }

    return (
      <ToggleGroupPrimitive.Item
        ref={ref}
        data-slot="toggle-group-item"
        data-variant={context.variant || variant}
        data-size={context.size || size}
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
          className
        )}
        {...props}
      >
        {children || label}
      </ToggleGroupPrimitive.Item>
    );
  }
);
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
