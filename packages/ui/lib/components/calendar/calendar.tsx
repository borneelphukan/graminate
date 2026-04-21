import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import * as React from "react";
import {
  DayButton,
  DayPicker,
  getDefaultClassNames,
  type DateRange,
} from "react-day-picker";
import { de } from "date-fns/locale";

type CalendarModeProps = {
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | DateRange;
  onSelect?: (value: Date | Date[] | DateRange | undefined) => void;
};

import { cn } from "../../utils";
import { Button, buttonVariants } from "../button/button";
import { Input } from "../input/input";
import { format, isValid, parse } from "date-fns";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  showInputField = false,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  showInputField?: boolean;
}) {
  const { mode, selected, onSelect } = props as CalendarModeProps;
  const defaultClassNames = getDefaultClassNames();

  const [dateStr, setDateStr] = React.useState("");
  const [rangeStartStr, setRangeStartStr] = React.useState("");
  const [rangeEndStr, setRangeEndStr] = React.useState("");

  // Sync inputs with selected props
  React.useEffect(() => {
    if (mode === "single") {
      setDateStr(selected ? format(selected as Date, "dd / MM / yyyy") : "");
    } else if (mode === "range") {
      const range = selected as { from?: Date; to?: Date } | undefined;
      setRangeStartStr(range?.from ? format(range.from, "dd / MM / yyyy") : "");
      setRangeEndStr(range?.to ? format(range.to, "dd / MM / yyyy") : "");
    }
  }, [mode, selected]);

  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateStr(val);
    const parsed = parse(val, "dd / MM / yyyy", new Date());
    if (isValid(parsed) && val.length === 14) {
      onSelect?.(parsed);
    }
  };

  const handleRangeStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRangeStartStr(val);
    const parsed = parse(val, "dd / MM / yyyy", new Date());
    if (isValid(parsed) && val.length === 14) {
      const range = selected as { from?: Date; to?: Date } | undefined;
      onSelect?.({ ...range, from: parsed });
    }
  };

  const handleRangeEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRangeEndStr(val);
    const parsed = parse(val, "dd / MM / yyyy", new Date());
    if (isValid(parsed) && val.length === 14) {
      const range = selected as { from?: Date; to?: Date } | undefined;
      onSelect?.(
        range?.from
          ? { from: range.from, to: parsed }
          : { from: range?.from, to: parsed }
      );
    }
  };

  const uuid = React.useId();

  return (
    <div
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
    >
      <DayPicker
        locale={de}
        showOutsideDays={showOutsideDays}
        className={cn("w-fit")}
        captionLayout={captionLayout}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString("de", { month: "short" }),
          ...formatters,
        }}
        classNames={{
          root: cn("w-fit", defaultClassNames.root),
          months: cn(
            "flex gap-4 flex-col md:flex-row relative",
            defaultClassNames.months
          ),
          month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
          nav: cn(
            "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-end",
            defaultClassNames.nav
          ),
          button_previous: cn(
            buttonVariants({ variant: buttonVariant }),
            "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none hover:bg-accent hover:text-accent-foreground",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: buttonVariant }),
            "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none hover:bg-accent hover:text-accent-foreground",
            defaultClassNames.button_next
          ),
          month_caption: cn(
            "flex items-center justify-start h-(--cell-size) w-full pl-2",
            defaultClassNames.month_caption
          ),
          dropdowns: cn(
            "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-4",
            defaultClassNames.dropdowns
          ),
          dropdown_root: cn(
            "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
            defaultClassNames.dropdown_root
          ),
          dropdown: cn(
            "absolute bg-popover inset-0 opacity-0",
            defaultClassNames.dropdown
          ),
          caption_label: cn(
            "select-none font-medium",
            captionLayout === "label"
              ? "text-sm"
              : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
            defaultClassNames.caption_label
          ),
          table: "w-full border-collapse",
          weekdays: cn("flex", defaultClassNames.weekdays),
          weekday: cn(
            "text-muted-foreground rounded-md flex-1 font-semibold text-[0.8rem] select-none",
            defaultClassNames.weekday
          ),
          week: cn("flex w-full mt-2", defaultClassNames.week),
          week_number_header: cn(
            "select-none w-(--cell-size)",
            defaultClassNames.week_number_header
          ),
          week_number: cn(
            "text-[0.8rem] select-none text-muted-foreground",
            defaultClassNames.week_number
          ),
          day: cn(
            "relative w-full h-full p-0 text-center group/day aspect-square select-none",
            defaultClassNames.day
          ),
          range_start: cn(
            "rounded-l-full rounded-r-none bg-green-200/10",
            defaultClassNames.range_start
          ),
          range_middle: cn(
            "rounded-none bg-green-200/10",
            defaultClassNames.range_middle
          ),
          range_end: cn(
            "rounded-r-full rounded-l-none bg-green-200/10",
            defaultClassNames.range_end
          ),
          today: cn(
            "bg-accent text-accent-foreground rounded-full data-[selected=true]:rounded-full",
            defaultClassNames.today
          ),
          outside: cn(
            "text-neutral-light-gray aria-selected:text-neutral-light-gray",
            defaultClassNames.outside
          ),
          disabled: cn(
            "text-muted-foreground opacity-50",
            defaultClassNames.disabled
          ),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => {
            return (
              <div
                data-slot="calendar"
                ref={rootRef as any}
                className={cn(className)}
                {...props}
              />
            );
          },
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return (
                <ChevronLeftIcon
                  className={cn("size-4", className)}
                  {...props}
                />
              );
            }

            if (orientation === "right") {
              return (
                <ChevronRightIcon
                  className={cn("size-4", className)}
                  {...props}
                />
              );
            }

            return (
              <ChevronDownIcon className={cn("size-4", className)} {...props} />
            );
          },
          DayButton: CalendarDayButton,
          WeekNumber: ({ children, ...props }) => {
            return (
              <td {...props}>
                <div className="flex size-(--cell-size) items-center justify-center text-center">
                  {children}
                </div>
              </td>
            );
          },
          ...components,
        }}
        {...props}
      />
      {showInputField && mode === "single" && (
        <div className="mt-4">
          <Input
            id={`${uuid}-single`}
            label="Date"
            hideLabel
            value={dateStr}
            onChange={handleSingleChange}
            placeholder="DD / MM / YYYY"
            className="w-full"
          />
        </div>
      )}
      {showInputField && mode === "range" && (
        <div className="mt-4 flex flex-col gap-2">
          <Input
            id={`${uuid}-start`}
            label="Start Date"
            hideLabel
            value={rangeStartStr}
            onChange={handleRangeStartChange}
            placeholder="DD / MM / YYYY"
            className="w-full"
          />
          <Input
            id={`${uuid}-end`}
            label="End Date"
            hideLabel
            value={rangeEndStr}
            onChange={handleRangeEndChange}
            placeholder="DD / MM / YYYY"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-brand-mute-green data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:hover:bg-brand-mute-green data-[range-middle=true]:bg-green-200/10 data-[range-middle=true]:text-accent-foreground data-[range-middle=true]:hover:bg-green-200/10 data-[range-start=true]:bg-brand-mute-green data-[range-start=true]:text-primary-foreground data-[range-start=true]:hover:bg-brand-mute-green data-[range-end=true]:bg-brand-mute-green data-[range-end=true]:text-primary-foreground data-[range-end=true]:hover:bg-brand-mute-green group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 hover:bg-accent hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal rounded-full group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-middle=true]:rounded-none [&>span]:text-xs [&>span]:opacity-70",
        isWeekend && "text-neutral-gray",
        modifiers.outside && "text-neutral-light-gray",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
