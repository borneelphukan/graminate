import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as React from "react";

import { cn } from "../../utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  type = "line",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  type?: "line" | "dashed" | "dotted";
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        "shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        type === "line" && "bg-border",
        type !== "line" && "bg-transparent border-neutral-light-gray",
        type === "dashed" && "border-dashed",
        type === "dotted" && "border-dotted",
        type !== "line" &&
          (orientation === "horizontal" ? "border-b" : "border-l"),
        className
      )}
      {...props}
    />
  );
}

export { Separator };
