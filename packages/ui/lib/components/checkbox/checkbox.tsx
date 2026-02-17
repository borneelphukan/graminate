import { forwardRef, useId } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "../../utils";

export type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  "children"
> & {
  id?: string;
  label?: React.ReactNode;
  hint?: string;
  error?: string;
  disabled?: boolean;
};

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ id: providedId, label, hint, error, disabled, ...props }, ref) => {
    const fallbackId = useId();
    const id = providedId || fallbackId;

    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div
        className={cn(
          "flex flex-col gap-2",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <div className="flex items-start gap-2">
          <CheckboxPrimitive.Root
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={[hintId, errorId].filter(Boolean).join(" ")}
            className={cn(
              "peer mt-0.5 size-3.5 shrink-0 rounded-sm border [border-color:rgba(102,102,102,0.30)] hover:cursor-pointer",
              "focus-visible:outline-none focus:!ring-[2px] focus:!ring-brand-mute-green focus:!ring-offset-2 focus-visible:!ring-[2px] focus-visible:!ring-brand-mute-green focus-visible:!ring-offset-2",
              "data-[state=checked]:bg-[#149184] data-[state=checked]:text-primary-foreground",
              "aria-invalid:!ring-red-200 aria-invalid:border-destructive"
            )}
            {...props}
          >
            <CheckboxPrimitive.Indicator
              data-slot="checkbox-indicator"
              className="flex items-center justify-center text-current transition-none"
            >
              <CheckIcon className="size-3.5" />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>

          <div className="grid gap-1.5 leading-none">
            {label && (
              <label
                htmlFor={id}
                className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </label>
            )}
            {hint && (
              <p id={hintId} className="text-xs text-muted-foreground">
                {hint}
              </p>
            )}
            {error && (
              <p id={errorId} className="text-xs text-destructive">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export { Checkbox };
