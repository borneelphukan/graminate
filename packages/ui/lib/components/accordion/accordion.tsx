import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../../utils";

type AccordionMode = "text" | "card";

interface AccordionContextValue {
  mode: AccordionMode;
}

const AccordionContext = React.createContext<AccordionContextValue>({
  mode: "text",
});

function Accordion({
  mode = "text",
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root> & {
  mode?: AccordionMode;
}) {
  return (
    <AccordionContext.Provider value={{ mode }}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        className={cn(mode === "card" && "space-y-4", className)}
        {...props}
      />
    </AccordionContext.Provider>
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const { mode } = React.useContext(AccordionContext);

  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        mode === "text" && "border-b last:border-b-0 border-neutral-light-gray",
        mode === "card" &&
          "bg-card text-card-foreground rounded-lg border border-neutral-light-gray bg-accent",
        className
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  subtitle,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  subtitle?: React.ReactNode;
}) {
  const { mode } = React.useContext(AccordionContext);

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 py-4 text-left text-sm font-medium transition-all outline-none group focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          mode === "text" && "rounded-md",
          mode === "card" && "px-6",
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-1">
          <div className={cn(mode === "text" && "group-hover:underline")}>
            {children}
          </div>
          {subtitle && (
            <div className="text-muted-foreground font-normal">{subtitle}</div>
          )}
        </div>
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  const { mode } = React.useContext(AccordionContext);

  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden",
        mode === "text" && "text-sm"
      )}
      {...props}
    >
      {mode === "card" ? (
        <div
          className={cn(
            "bg-white border border-neutral-light-gray rounded-lg p-2 m-2",
            className
          )}
        >
          <div className="p-3">{children}</div>
        </div>
      ) : (
        <div className={cn("pt-0 pb-4", className)}>{children}</div>
      )}
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
