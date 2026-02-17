import type { Meta, StoryObj } from "@storybook/react";

import { DatePicker } from "./datepicker";

const meta = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A component that allows users to select a date from a calendar popover. Supports labels, hints, errors, and date range constraints.",
      },
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const BasicDemo = (
  args: Omit<React.ComponentProps<typeof DatePicker>, "id">
) => {
  return (
    <div className="flex flex-col gap-8 max-w-sm">
      <DatePicker {...args} id="basic-datepicker" />
      <DatePicker
        {...args}
        id="hidden-label-datepicker"
        label="Hidden Label"
        hideLabel
      />
    </div>
  );
};

const StatesDemo = (
  args: Omit<React.ComponentProps<typeof DatePicker>, "id">
) => {
  return (
    <div className="flex flex-col gap-8 max-w-sm">
      <DatePicker
        {...args}
        id="hint-datepicker"
        label="With Hint"
        hint="Please select a date for your appointment."
      />
      <DatePicker
        {...args}
        id="error-datepicker"
        label="With Error"
        error="This field is required."
      />
      <DatePicker
        {...args}
        id="disabled-datepicker"
        label="Disabled"
        disabled
      />
    </div>
  );
};

const ComplexDemo = (
  args: Omit<React.ComponentProps<typeof DatePicker>, "id">
) => {
  return (
    <div className="flex flex-col gap-8 max-w-sm">
      <DatePicker
        {...args}
        id="disable-past-datepicker"
        label="Future Dates Only"
        disablePast
        hint="You can only select dates from today onwards."
      />
      <DatePicker
        {...args}
        id="custom-year-datepicker"
        label="Custom Year Range (2020-2030)"
        fromYear={2020}
        toYear={2030}
      />
    </div>
  );
};

export const Basic: Story = {
  render: ({ id, ...args }) => <BasicDemo {...args} />,
  args: {
    label: "Select a Date",
    id: "basic-datepicker-story",
  },
};

export const States: Story = {
  render: ({ id, ...args }) => <StatesDemo {...args} />,
  args: {
    label: "Select a Date",
    id: "states-datepicker-story",
  },
};

export const Complex: Story = {
  render: ({ id, ...args }) => <ComplexDemo {...args} />,
  args: {
    label: "Select a Date",
    id: "complex-datepicker-story",
  },
};
