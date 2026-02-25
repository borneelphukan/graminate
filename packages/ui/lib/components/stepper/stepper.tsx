import * as React from "react";

import { Check } from "lucide-react";
import { cn } from "../../utils";

const StepperContext = React.createContext<{
  activeStep: number;
  orientation: "horizontal" | "vertical";
  isSubStepper: boolean;
  disableConnector: boolean;
}>({
  activeStep: 0,
  orientation: "horizontal",
  isSubStepper: false,
  disableConnector: false,
});

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep?: number;
  orientation?: "horizontal" | "vertical";
  disableConnector?: boolean;
}

function Stepper({
  activeStep = 0,
  orientation = "horizontal",
  disableConnector = false,
  className,
  children,
  ...props
}: StepperProps) {
  return (
    <StepperContext.Provider
      value={{ activeStep, orientation, isSubStepper: false, disableConnector }}
    >
      <div
        data-slot="stepper"
        className={cn(
          "flex",
          orientation === "vertical" ? "flex-col gap-4" : "flex-row",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              // @ts-expect-error - index is injected dynamically
              index,
              isLast: index === React.Children.count(children) - 1,
            });
          }
          return child;
        })}
      </div>
    </StepperContext.Provider>
  );
}

interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
  isLast?: boolean;
}

const StepperItemContext = React.createContext<{
  isActive: boolean;
  isCompleted: boolean;
} | null>(null);

function StepperItem({
  className,
  children,
  index = 0,
  isLast,
  ...props
}: StepperItemProps) {
  const { activeStep, orientation, isSubStepper, disableConnector } =
    React.useContext(StepperContext);
  const isCompleted = index < activeStep;
  const isActive = index === activeStep;

  const childrenArray = React.Children.toArray(children);

  const renderChildren = childrenArray.map((child) => {
    if (React.isValidElement(child)) {
      if (child.type === SubStepper) {
        return orientation === "vertical" ? child : null;
      }
      if (child.type === StepperContent) {
        return child;
      }
      return React.cloneElement(child, {
        // @ts-expect-error - stepper state props are injected dynamically
        isActive,
        isCompleted,
        step: index + 1,
        isLast,
        isFirst: index === 0,
      });
    }
    return child;
  });

  const indicator = renderChildren.find(
    (child) => React.isValidElement(child) && child.type === StepperIndicator
  );
  const content = renderChildren.filter(
    (child) => React.isValidElement(child) && child.type !== StepperIndicator
  );

  const hasSubStepper = childrenArray.some(
    (child) =>
      React.isValidElement(child) &&
      child.type === SubStepper &&
      orientation === "vertical"
  );

  return (
    <StepperItemContext.Provider value={{ isActive, isCompleted }}>
      <div
        data-slot="stepper-item"
        className={cn(
          "relative flex",
          orientation === "vertical" ? "flex-col" : "flex-1 flex-col",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "flex w-full",
            orientation === "vertical"
              ? isSubStepper
                ? "flex-row items-start gap-4"
                : "flex-row items-start gap-6"
              : "flex-col items-center text-center"
          )}
        >
          {orientation === "vertical" && !isLast && !disableConnector && (
            <div
              className={cn(
                "absolute w-[3px] bg-border",
                isSubStepper ? "bottom-[-0.5rem]" : "bottom-[-1rem]",
                isSubStepper ? "left-[5px] top-[8px]" : "left-[19px] top-[20px]"
              )}
            >
              <div
                className={cn(
                  "w-full bg-brand-mute-green transition-all duration-300 ease-linear"
                )}
                style={{
                  height: isCompleted
                    ? "100%"
                    : isActive && hasSubStepper
                      ? "50%"
                      : "0%",
                }}
              />
            </div>
          )}

          {orientation === "horizontal" && !isLast && !disableConnector && (
            <div
              className={cn(
                "absolute top-[20px] left-[50%] w-full h-[2px] bg-border -z-10 group-data-[orientation=horizontal]:block"
              )}
            >
              <div
                className={cn(
                  "h-full bg-brand-mute-green transition-all duration-300 ease-linear"
                )}
                style={{
                  width: isCompleted
                    ? "100%"
                    : isActive && hasSubStepper
                      ? "50%"
                      : "0%",
                }}
              />
            </div>
          )}

          {indicator}

          <div className={cn("flex flex-col w-full pt-1.5")}>{content}</div>
        </div>
      </div>
    </StepperItemContext.Provider>
  );
}

interface StepperIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
  isCompleted?: boolean;
  step?: number;
  icon?: React.ReactNode;
  isLast?: boolean;
  isFirst?: boolean;
}

function StepperIndicator({
  className,
  isActive,
  isCompleted,
  step,
  icon,
  isLast,
  isFirst,
  ...props
}: StepperIndicatorProps) {
  const { isSubStepper } = React.useContext(StepperContext);

  if (isSubStepper) {
    let bgColor = "bg-neutral-light-gray";
    if (isActive) {
      bgColor = "bg-brand-green ring-4 ring-brand-mute-green";
    } else if (isCompleted) {
      bgColor = "bg-brand-mute-green ring-2 ring-brand-mute-green";
    }

    return (
      <div
        data-slot="stepper-indicator"
        className={cn(
          "relative z-10 flex h-3 w-3 shrink-0 rounded-full mt-1.5 transition-colors",
          bgColor,
          className
        )}
        {...props}
      />
    );
  }

  return (
    <div
      data-slot="stepper-indicator"
      className={cn(
        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 bg-background",
        isActive
          ? "border-2 border-card text-primary"
          : isCompleted
            ? "bg-brand-mute-green text-white"
            : "border-2 border-muted text-muted-foreground",
        className
      )}
      {...props}
    >
      {isActive && (
        <div
          className={cn(
            "absolute -inset-[5px] rounded-full border-[3px] border-neutral-light-gray rotate-45 pointer-events-none",
            !isFirst &&
              !isLast &&
              "border-b-brand-mute-green border-l-brand-mute-green"
          )}
        />
      )}
      {isCompleted ? <Check className="h-5 w-5" /> : icon || step}
    </div>
  );
}

function StepperContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { orientation, isSubStepper } = React.useContext(StepperContext);
  return (
    <div
      data-slot="stepper-content"
      className={cn(
        orientation === "vertical"
          ? isSubStepper
            ? "pl-0 pb-2"
            : "pl-0 pb-4"
          : "mt-2",
        className
      )}
      {...props}
    />
  );
}

function StepperTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { isSubStepper } = React.useContext(StepperContext);
  return (
    <h3
      data-slot="stepper-title"
      className={cn(
        "font-medium leading-none tracking-tight",
        isSubStepper ? "text-sm" : "text-base",
        className
      )}
      {...props}
    />
  );
}

function StepperDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="stepper-description"
      className={cn("text-sm text-muted-foreground mt-1", className)}
      {...props}
    />
  );
}

function SubStepper({
  className,
  children,
  activeStep = 0,
  disableConnector = false,
  ...props
}: StepperProps) {
  const { orientation: parentOrientation } = React.useContext(StepperContext);
  const parentItem = React.useContext(StepperItemContext);
  const effectiveActiveStep =
    parentItem && !parentItem.isActive && !parentItem.isCompleted
      ? -1
      : activeStep;

  return (
    <StepperContext.Provider
      value={{
        activeStep: effectiveActiveStep,
        orientation: parentOrientation,
        isSubStepper: true,
        disableConnector,
      }}
    >
      <div
        data-slot="sub-stepper"
        className={cn(
          "mt-4 flex gap-2",
          parentOrientation === "vertical" ? "flex-col" : "flex-row",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              // @ts-expect-error - index is injected dynamically
              index,
              isLast: index === React.Children.count(children) - 1,
            });
          }
          return child;
        })}
      </div>
    </StepperContext.Provider>
  );
}

export {
  Stepper,
  StepperItem,
  StepperIndicator,
  StepperContent,
  StepperTitle,
  StepperDescription,
  SubStepper,
};
