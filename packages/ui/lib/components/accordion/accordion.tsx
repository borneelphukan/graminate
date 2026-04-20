import * as React from "react";
import { Icon } from "../icon/icon";

type AccordionMode = "text" | "card";

interface AccordionContextValue {
  activeValues: string[];
  toggleItem: (value: string) => void;
  mode: AccordionMode;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

interface AccordionItemContextValue {
  value: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | undefined>(undefined);

const joinClasses = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  mode?: AccordionMode;
}

function Accordion({
  type = "single",
  collapsible = false,
  defaultValue,
  value: controlledValue,
  onValueChange,
  mode = "text",
  className = "",
  ...props
}: AccordionProps) {
  const [internalValue, setInternalValue] = React.useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const activeValues = controlledValue 
    ? (Array.isArray(controlledValue) ? controlledValue : [controlledValue])
    : internalValue;

  const toggleItem = React.useCallback((itemValue: string) => {
    let nextValue: string[];

    if (type === "single") {
      const isAlreadyOpen = activeValues.includes(itemValue);
      if (isAlreadyOpen) {
        nextValue = collapsible ? [] : [itemValue];
      } else {
        nextValue = [itemValue];
      }
    } else {
      nextValue = activeValues.includes(itemValue)
        ? activeValues.filter((v) => v !== itemValue)
        : [...activeValues, itemValue];
    }

    if (controlledValue === undefined) {
      setInternalValue(nextValue);
    }
    
    if (onValueChange) {
      onValueChange(type === "single" ? (nextValue[0] || "") : nextValue);
    }
  }, [type, collapsible, activeValues, controlledValue, onValueChange]);

  const classes = joinClasses(
    mode === "card" ? "space-y-4" : "",
    className
  );

  return (
    <AccordionContext.Provider value={{ activeValues, toggleItem, mode }}>
      <div 
        data-slot="accordion" 
        className={classes} 
        {...props} 
      />
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function AccordionItem({ value, className = "", ...props }: AccordionItemProps) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error("AccordionItem must be used within Accordion");

  const isOpen = context.activeValues.includes(value);
  const { mode } = context;

  const classes = joinClasses(
    mode === "text" ? "border-b last:border-b-0 border-gray-200 dark:border-gray-700" : "",
    mode === "card" ? "bg-white dark:bg-gray-800 rounded-xl border border-gray-400 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300" : "",
    className
  );

  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div
        data-slot="accordion-item"
        data-state={isOpen ? "open" : "closed"}
        className={classes}
        {...props}
      />
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  subtitle?: React.ReactNode;
}

function AccordionTrigger({ 
  className = "", 
  children, 
  subtitle, 
  onClick,
  ...props 
}: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);

  if (!context || !itemContext) {
    throw new Error("AccordionTrigger must be used within AccordionItem");
  }

  const { mode, toggleItem, activeValues } = context;
  const { value } = itemContext;
  const isOpen = activeValues.includes(value);

  const classes = joinClasses(
    "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 py-5 text-left text-base font-semibold transition-all outline-none group focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 w-full",
    mode === "text" ? "rounded-lg" : "",
    mode === "card" ? "px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50" : "",
    className
  );

  return (
    <div className="flex">
      <button
        type="button"
        data-slot="accordion-trigger"
        data-state={isOpen ? "open" : "closed"}
        className={classes}
        onClick={(e) => {
          toggleItem(value);
          onClick?.(e);
        }}
        {...props}
      >
        <div className="flex flex-col gap-1.5">
          <div className={joinClasses(mode === "text" ? "group-hover:underline" : "")}>
            {children}
          </div>
          {subtitle && (
            <div className="text-gray-500 dark:text-gray-400 font-normal text-sm">{subtitle}</div>
          )}
        </div>
        <Icon 
          type="keyboard_arrow_down" 
          className={joinClasses(
            "text-gray-400 pointer-events-none size-5 shrink-0 translate-y-0.5 transition-transform duration-300 ease-in-out",
            isOpen ? "rotate-180" : ""
          )} 
        />
      </button>
    </div>
  );
}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function AccordionContent({
  className = "",
  children,
  ...props
}: AccordionContentProps) {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);

  if (!context || !itemContext) {
    throw new Error("AccordionContent must be used within AccordionItem");
  }

  const { mode, activeValues } = context;
  const { value } = itemContext;
  const isOpen = activeValues.includes(value);

  const contentClasses = joinClasses(
    "grid transition-all duration-300 ease-in-out text-sm",
    mode === "card" ? "bg-transparent" : "",
    className
  );

  const innerClasses = joinClasses(
    "pb-6 pt-0 leading-relaxed text-gray-600 dark:text-gray-300",
    mode === "card" ? "px-6" : ""
  );

  return (
    <div
      data-slot="accordion-content"
      data-state={isOpen ? "open" : "closed"}
      className={contentClasses}
      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      {...props}
    >
      <div className="overflow-hidden">
        <div className={innerClasses}>
          {children}
        </div>
      </div>
    </div>
  );
}


export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
