import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";
import { forwardRef, createContext, useContext } from "react";

import { cn } from "../../utils";

const TooltipProvider = ({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
);

type TooltipContextType = {
  side?: "top" | "right" | "bottom" | "left";
};

const TooltipContext = createContext<TooltipContextType>({});

type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root> & {
  side?: "top" | "right" | "bottom" | "left";
};

const Tooltip = ({ side, ...props }: TooltipProps) => (
  <TooltipContext.Provider value={{ side }}>
    <TooltipPrimitive.Root {...props} />
  </TooltipContext.Provider>
);

const TooltipTrigger = ({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) => (
  <TooltipPrimitive.Trigger {...props} />
);

type TooltipContentProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> & {
  header?: React.ReactNode;
  content?: React.ReactNode;
};

const TooltipContent = forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      className,
      sideOffset = 0,
      side: propSide,
      header,
      content,
      children,
      ...props
    },
    ref
  ) => {
    const { side: contextSide } = useContext(TooltipContext);

    const side = propSide ?? contextSide;

    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          side={side}
          className={cn(
            "z-50 px-3 py-2 text-sm",
            "rounded-lg bg-popover text-popover-foreground border border-neutral-dark-gray/20",
            "animate-in fade-in-0 zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          style={{ maxWidth: "288px" }}
          {...props}
        >
          {header && (
            <div className="mb-1.5 font-semibold text-popover-foreground">
              {header}
            </div>
          )}
          {content && (
            <p
              className={cn(
                header
                  ? "text-popover-foreground/90"
                  : "text-popover-foreground"
              )}
            >
              {content}
            </p>
          )}

          {!header && !content && children}

          <TooltipPrimitive.Arrow className="bg-popover fill-popover border border-neutral-light-gray z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] [clip-path:polygon(14%_100%,100%_14%,100%_100%)]" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    );
  }
);

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
