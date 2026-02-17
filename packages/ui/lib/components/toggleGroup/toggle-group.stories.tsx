import type { Meta, StoryObj } from "@storybook/react";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const meta: Meta<typeof ToggleGroup> = {
  title: "Components/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    docs: {
      description: {
        component: "A toggle group component for grouped toggle buttons.",
      },
    },
  },
  argTypes: {
    type: {
      control: "radio",
      options: ["single", "multiple"],
      description: "The type of toggle group.",
    },
    variant: {
      control: "radio",
      options: ["default", "outline"],
    },
    size: {
      control: "radio",
      options: ["default", "sm", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Default: Story = {
  args: {
    type: "single",
    className: "w-full",
  },
  render: () => (
    <ToggleGroup type="single" className="w-full">
      <ToggleGroupItem
        value="a"
        label="Option A"
        description="Description for Option A"
      />
      <ToggleGroupItem
        value="b"
        label="Option B"
        description="Description for Option B"
      />
      <ToggleGroupItem
        value="c"
        label="Option C"
        description="Description for Option C"
      />
    </ToggleGroup>
  ),
};

export const DefaultWithIcons: Story = {
  args: {
    type: "single",
    className: "w-full",
  },
  render: () => (
    <ToggleGroup type="single" className="w-full">
      <ToggleGroupItem
        value="wifi"
        label="Wi-Fi"
        description="Wireless internet connection"
        icon="wifi"
      />
      <ToggleGroupItem
        value="bluetooth"
        label="Bluetooth"
        description="Wireless device connection"
        icon="bluetooth"
      />
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  args: {
    type: "multiple",
    className: "w-full",
  },
  render: () => (
    <ToggleGroup type="multiple" className="w-full">
      <ToggleGroupItem
        value="a"
        label="Option A"
        description="Description for Option A"
      />
      <ToggleGroupItem
        value="b"
        label="Option B"
        description="Description for Option B"
      />
      <ToggleGroupItem
        value="c"
        label="Option C"
        description="Description for Option C"
      />
    </ToggleGroup>
  ),
};
