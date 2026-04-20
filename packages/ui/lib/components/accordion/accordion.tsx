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
        mode === "text" && "border-b last:border-b-0 border-gray-200 dark:border-gray-700",
        mode === "card" &&
          "bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
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
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 py-5 text-left text-base font-semibold transition-all outline-none group focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          mode === "text" && "rounded-lg",
          mode === "card" && "px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50",
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-1.5">
          <div className={cn(mode === "text" && "group-hover:underline")}>
            {children}
          </div>
          {subtitle && (
            <div className="text-gray-500 dark:text-gray-400 font-normal text-sm">{subtitle}</div>
          )}
        </div>
        <ChevronDownIcon className="text-gray-400 pointer-events-none size-5 shrink-0 translate-y-0.5 transition-transform duration-300 ease-in-out" />
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
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm",
        mode === "card" && "bg-transparent",
        className
      )}
      {...props}
    >
      <div className={cn(
        "pb-6 pt-0 leading-relaxed text-gray-600 dark:text-gray-300",
        mode === "card" && "px-6",
        className
      )}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
