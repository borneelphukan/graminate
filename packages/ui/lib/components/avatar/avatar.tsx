import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";

import { cn } from "../../utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
}

function AvatarGroup({
  children,
  className,
  limit,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { limit?: number }) {
  const childrenArray = React.Children.toArray(children);
  const excess =
    limit && childrenArray.length > limit ? childrenArray.length - limit : 0;
  const itemsToShow = limit ? childrenArray.slice(0, limit) : childrenArray;

  return (
    <div className={cn("flex items-center -space-x-5", className)} {...props}>
      {itemsToShow.map((child) => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(
          child as React.ReactElement<{ className?: string }>,
          {
            className: cn(
              (child as React.ReactElement<{ className?: string }>).props
                .className
            ),
          }
        );
      })}
      {excess > 0 && (
        <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
          +{excess}
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarFallback, AvatarImage, AvatarGroup };
