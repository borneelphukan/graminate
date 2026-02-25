import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../utils";
import { Icon } from "../icon/icon";

const alertVariants = cva(
  "relative w-full rounded-[var(--radius-lg)] border border-neutral-light-gray px-4 py-3 text-sm flex items-center gap-3 [&>svg]:shrink-0 [&>svg]:text-current [&>i]:shrink-0 [&>i]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        error:
          "bg-red-200/10 text-red-400 border-black/10 [&>svg]:text-current *:data-[slot=alert-description]:text-current",
        success:
          "bg-green-200/10 text-brand-mute-green border-black/10 [&>svg]:text-current *:data-[slot=alert-description]:text-current",
        warning:
          "bg-yellow-200/10 text-yellow-400 border-black/10 [&>svg]:text-current *:data-[slot=alert-description]:text-current",
        neutral:
          "bg-neutral-gray/10 text-neutral-black border-neutral-black/20 [&>svg]:text-current *:data-[slot=alert-description]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  const iconMap: Record<string, React.ComponentProps<typeof Icon>["type"]> = {
    default: "info",
    warning: "warning",
    error: "error",
    success: "check",
    neutral: "info",
  };

  const icon = iconMap[variant || "default"];

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon && <Icon type={icon} />}
      {children}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
