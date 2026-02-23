import { forwardRef, useId } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

export type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  "children"
> & {
  label?: React.ReactNode;
  hint?: string;
  error?: string;
};

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ id: providedId, label, hint, error, className = "", disabled, ...props }, ref) => {
    const fallbackId = useId();
    const id = providedId || fallbackId;

    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className={`flex flex-col gap-2 ${disabled ? "cursor-not-allowed opacity-50" : ""}`.trim()}>
        <div className="flex items-center gap-2">
          <CheckboxPrimitive.Root
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={[hintId, errorId].filter(Boolean).join(" ")}
            className={`peer shrink-0 flex items-center justify-center rounded border-2 focus-visible:outline-none focus:ring-2 focus:ring-offset-2 hover:cursor-pointer disabled:cursor-not-allowed bg-transparent ${
              error
                ? "border-red-500 focus:ring-red-500 text-red-500"
                : "border-gray-300 dark:border-gray-300 data-[state=checked]:border-green-200 dark:data-[state=checked]:border-green-200 focus:ring-green-200 focus:border-green-200 text-green-200 dark:text-green-200"
            } ${
              !className.includes("w-") && !className.includes("h-") && !className.includes("size-") ? "w-4 h-4" : ""
            } ${className}`.trim()}
            {...props}
          >
            <CheckboxPrimitive.Indicator
              data-slot="checkbox-indicator"
              className="flex items-center justify-center text-current w-full h-full"
            >
              <CheckIcon 
                className="size-3" 
                strokeWidth={4} 
                color="currentColor"
              />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>

          {(label || hint || error) && (
            <div className="grid gap-1.5 leading-none">
              {label && (
                <label
                  htmlFor={id}
                  className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-dark dark:text-light cursor-pointer"
                >
                  {label}
                </label>
              )}
              {hint && (
                <p id={hintId} className="text-xs text-gray-500 dark:text-gray-400">
                  {hint}
                </p>
              )}
              {error && (
                <p id={errorId} className="text-xs text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
