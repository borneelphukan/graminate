import type { Meta, StoryObj } from "@storybook/react";

import { Calendar } from "./calendar";

const CalendarDemo = () => (
  <Calendar mode="single" selected={new Date()} className="rounded-md border" />
);

const meta: Meta<typeof CalendarDemo> = {
  title: "Components/Calendar",
  component: CalendarDemo,
  parameters: {
    docs: {
      description: {
        component:
          "A calendar component for date selection. For more information, see the [shadcn/ui Calendar documentation](https://ui.shadcn.com/docs/components/calendar).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

import { addDays } from "date-fns";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border shadow-sm"
      />
    );
  },
};

export const Multiple: Story = {
  render: () => {
    const [dates, setDates] = useState<Date[] | undefined>([
      new Date(),
      addDays(new Date(), 2),
      addDays(new Date(), 4),
    ]);

    return (
      <Calendar
        mode="multiple"
        selected={dates}
        onSelect={setDates}
        className="rounded-md border shadow-sm"
      />
    );
  },
};

export const Range: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(),
      to: addDays(new Date(), 5),
    });

    return (
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        className="rounded-md border shadow-sm"
      />
    );
  },
};
