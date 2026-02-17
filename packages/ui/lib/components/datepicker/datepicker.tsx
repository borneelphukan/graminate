import * as React from "react";
import { forwardRef } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../utils";
import { Button } from "../button/button";
import { Calendar } from "../calendar/calendar";
import { Layout } from "../layouts/layout";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import { Label } from "../label/label";

type DatePickerProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "onSelect"
> & {
  id: string;
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  fromYear?: number;
  toYear?: number;
  disablePast?: boolean;
};

const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      className,
      id,
      label,
      hideLabel,
      hint,
      error,
      fromYear = new Date().getFullYear() - 100,
      toYear = new Date().getFullYear() + 10,
      disablePast = false,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(undefined);

    return (
      <Layout
        className={cn(
          "flex flex-col gap-1.5 group/input",
          props.disabled && "cursor-not-allowed opacity-50"
        )}
        data-disabled={props.disabled}
      >
        <Label
          htmlFor={id}
          className={cn(
            hideLabel
              ? "sr-only"
              : "text-neutral-gray font-medium text-sm group-focus-within/input:text-neutral-dark-gray"
          )}
        >
          {label}
        </Label>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              id={id}
              ref={ref}
              name={id}
              className={cn(
                "w-48 justify-between font-normal",
                error && "border-red-200",
                className
              )}
              {...props}
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              disabled={disablePast ? { before: new Date() } : undefined}
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
              }}
              startMonth={new Date(fromYear, 0, 1)}
              endMonth={new Date(toYear, 11, 31)}
            />
          </PopoverContent>
        </Popover>

        {hint && (
          <span className="text-neutral-gray font-normal text-xs">{hint}</span>
        )}
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </Layout>
    );
  }
);

export { DatePicker };
