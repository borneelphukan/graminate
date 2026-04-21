import * as React from "react";
import { forwardRef } from "react";
import { cn } from "../../utils";
import { Layout } from "../layouts/layout";

type TextareaProps = React.ComponentPropsWithoutRef<"textarea"> & {
  id: string;
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
};

const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, id, label, hideLabel, hint, error, placeholder, ...props },
    ref
  ) => {
    return (
      <Layout className="disabled:cursor-not-allowed disabled:opacity-50">
        <label className="flex flex-col gap-1.5 group/input disabled:pointer-events-none">
          <span
            className={
              hideLabel
                ? "sr-only"
                : "text-neutral-gray font-medium text-sm group-focus-within/input:text-neutral-dark-gray"
            }
          >
            {label}
          </span>

          <div
            className={cn(
              "flex flex-row gap-2 items-start py-2 px-3 rounded-[var(--radius-md)] border-1 border-neutral-light-gray/40 shadow-xs shadow-black/20 transition-colors",
              error && "border-red-200",
              "group-focus-within/input:!ring-1 group-focus-within/input:!ring-offset-2",
              error
                ? "group-focus-within/input:!ring-red-200"
                : "group-focus-within/input:!ring-green-200",
              className
            )}
          >
            <textarea
              className="border-none bg-transparent px-0.5 w-full placeholder-neutral-gray focus:outline-none focus:placeholder-neutral-dark-gray text-sm min-h-16 field-sizing-content"
              id={id}
              name={id}
              ref={ref}
              placeholder={placeholder}
              {...props}
            />
          </div>
          {hint && (
            <span className="text-neutral-gray font-normal text-xs">
              {hint}
            </span>
          )}
          {error && <span className="text-red-400 text-xs">{error}</span>}
        </label>
      </Layout>
    );
  }
);

export { TextArea };
