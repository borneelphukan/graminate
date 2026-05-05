import * as React from "react";
import { forwardRef, useState } from "react";

import { Label } from "../label/label";
import { Layout } from "../layouts/layout";

type SwitchProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "onChange"
> & {
  id: string;
  label?: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
};

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      id,
      label,
      hideLabel,
      hint,
      error,
      checked,
      defaultChecked,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = useState(
      defaultChecked ?? false
    );
    const isControlled = checked !== undefined;
    const displayChecked = isControlled ? checked : internalChecked;

    const handleClick = () => {
      if (disabled) return;

      const newCheckedState = !displayChecked;

      if (!isControlled) {
        setInternalChecked(newCheckedState);
      }

      onChange?.(newCheckedState);
    };

    return (
      <Layout className={disabled ? "cursor-not-allowed opacity-50" : ""}>
        <div className="flex items-center justify-between">
          <Label
            htmlFor={id}
            onClick={handleClick}
            className={`${disabled ? "text-gray-400" : "text-dark dark:text-light"} ${
              hideLabel ? "sr-only" : ""
            }`}
          >
            {label}
          </Label>

          <button
            id={id}
            ref={ref}
            type="button"
            role="switch"
            aria-checked={displayChecked}
            aria-readonly={disabled}
            disabled={disabled}
            onClick={handleClick}
            {...props}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-1 border-gray-400 outline-none focus:!ring-[2px] focus:!ring-offset-1 focus-visible:!ring-[2px] focus-visible:!ring-offset-1 ${
              error
                ? "focus:!ring-red-200 focus-visible:!ring-red-200"
                : "focus:!ring-green-200 focus-visible:!ring-green-200"
            } transition-colors duration-200 ease-in-out ml-2 ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            } ${displayChecked ? "bg-green-200" : "bg-gray-500"} ${
              className || ""
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-5 w-5 rounded-full bg-white transition duration-200 ease-in-out ${
                displayChecked ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {hint && (
          <span className="text-dark dark:text-light font-normal text-xs">{hint}</span>
        )}
        {error && <span className="text-red-200 text-xs">{error}</span>}
      </Layout>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
