import type { Meta, StoryObj } from "@storybook/react";
import { SegmentedControl } from "./segmented-control";

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    disabled: {
      control: { type: "boolean" },
    },
    onValueChange: { action: "value changed" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: {
      first: { value: "table", label: "Table", icon: "table_chart" },
      second: { value: "grid", label: "Grid", icon: "grid_view" },
    },
    defaultValue: "first",
  },
};

export const TextOnly: Story = {
  args: {
    options: {
      first: { value: "monthly", label: "Monthly" },
      second: { value: "yearly", label: "Yearly" },
    },
    defaultValue: "first",
  },
};
