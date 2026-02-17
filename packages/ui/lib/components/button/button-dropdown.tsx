import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "../../utils";
import { Icon, type IconType } from "../icon/icon";
import { Button, type ButtonProps } from "./button";

type DropdownItem = {
  label: string;
  value: string;
  icon?: IconType;
  disabled?: boolean;
};

interface DropdownButtonProps extends Omit<
  ButtonProps,
  "children" | "onSelect"
> {
  items: DropdownItem[];
  prefix?: string;
  label?: string;
  children?: React.ReactNode;
  onSelect?: (value: string) => void;
}

const dropdownVariantStyles: Record<string, string> = {
  primary: "btn-primary text-neutral-white border-[#14786e]",
  success:
    "text-neutral-white bg-gradient-to-b from-green-200 via-green-300 to-green-400 bg-size-[200%_200%] bg-position-[center_-2px] border-solid border-[oklch(var(--neutral-dark-gray)_/_12%)]",
  destructive:
    "text-neutral-white bg-gradient-to-b from-red-200 via-red-300 to-red-400 bg-size-[200%_200%] bg-position-[center_-2px] border-solid border-[oklch(var(--neutral-dark-gray)_/_12%)]",
  secondary:
    "btn-secondary text-foreground border-solid border-[oklch(var(--neutral-dark-gray)_/_12%)]",
  outline: "bg-popover text-popover-foreground border-neutral-light-gray",
  ghost: "bg-popover text-popover-foreground border-neutral-light-gray",
  link: "bg-popover text-popover-foreground border-neutral-light-gray",
};

const dropdownItemVariantStyles: Record<string, string> = {
  primary: "focus:bg-white/20 focus:text-white",
  success: "focus:bg-white/20 focus:text-white",
  destructive: "focus:bg-white/20 focus:text-white",
  secondary: "focus:bg-accent focus:text-accent-foreground",
  outline: "focus:bg-accent focus:text-accent-foreground",
  ghost: "focus:bg-accent focus:text-accent-foreground",
  link: "focus:bg-accent focus:text-accent-foreground",
};

const DropdownButton = React.forwardRef<HTMLButtonElement, DropdownButtonProps>(
  (
    { items, prefix, label, children, onSelect, className, variant, ...props },
    ref
  ) => {
    const isLightVariant =
      variant === "secondary" || variant === "outline" || variant === "ghost";

    const mainLabel = label || children;

    return (
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild>
          <Button
            ref={ref}
            className={cn("justify-between px-3", className)}
            variant={variant}
            {...props}
          >
            <div className="flex items-center gap-2">
              <Icon
                type="keyboard_arrow_down"
                size="md"
                className={cn(
                  isLightVariant ? "text-foreground" : "text-white"
                )}
              />
              {prefix && (
                <span
                  className={cn(
                    isLightVariant ? "text-foreground/60" : "text-white/60"
                  )}
                >
                  {prefix}
                </span>
              )}
              <span
                className={cn(
                  "font-medium",
                  isLightVariant ? "text-foreground" : "text-white"
                )}
              >
                {mainLabel}
              </span>
            </div>
          </Button>
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            sideOffset={4}
            className={cn(
              dropdownVariantStyles[(variant as string) || "primary"] ||
                dropdownVariantStyles.primary,
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
              "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
              "relative z-50 max-h-[--radix-dropdown-menu-content-available-height] w-[--radix-dropdown-menu-trigger-width]",
              "origin-[--radix-dropdown-menu-content-transform-origin] overflow-x-hidden overflow-y-auto",
              "rounded-md border-1 p-1 shadow-md"
            )}
          >
            {items.map((item) => (
              <DropdownMenuPrimitive.Item
                key={item.value}
                disabled={item.disabled}
                onSelect={() => onSelect?.(item.value)}
                className={cn(
                  dropdownItemVariantStyles[(variant as string) || "primary"] ||
                    dropdownItemVariantStyles.primary,
                  "[&_svg:not([class*='text-'])]:text-muted-foreground",
                  "relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm",
                  "outline-none select-none",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                )}
              >
                {item.icon && (
                  <Icon
                    type={item.icon}
                    size="md"
                    className="text-current shrink-0 pointer-events-none"
                  />
                )}
                {item.label}
              </DropdownMenuPrimitive.Item>
            ))}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    );
  }
);
DropdownButton.displayName = "DropdownButton";

export { DropdownButton, dropdownVariantStyles, dropdownItemVariantStyles };
export type { DropdownButtonProps, DropdownItem };
