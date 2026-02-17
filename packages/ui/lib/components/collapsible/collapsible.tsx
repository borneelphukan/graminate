import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as React from "react";

import { cn } from "../../utils";

function Collapsible({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      className={className}
      {...props}
    />
  );
}

function CollapsibleTrigger({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      className={cn(
        "cursor-pointer outline-none focus-visible:ring-ring focus-visible:ring-[3px]",
        className
      )}
      {...props}
    />
  );
}

function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      className={cn(
        "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
