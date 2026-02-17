import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Slider } from "./slider";

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  parameters: {
    docs: {
      description: {
        component: "A slider component for range inputs.",
      },
    },
    layout: "centered",
  },
  argTypes: {
    value: {
      control: "object",
      description:
        "The controlled value of the slider. Must be an array of numbers.",
    },
    defaultValue: {
      control: "object",
      description:
        "The default value of the slider when uncontrolled. Must be an array of numbers.",
    },
    min: {
      control: "number",
      description: "The minimum value of the slider.",
    },
    max: {
      control: "number",
      description: "The maximum value of the slider.",
    },
    step: {
      control: "number",
      description: "The stepping interval.",
    },
    disabled: {
      control: "boolean",
      description: "Prevents the user from interacting with the slider.",
    },
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "The orientation of the slider.",
    },
    onValueChange: {
      action: "changed",
      description: "Event handler called when the value changes.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    defaultValue: [33],
    max: 100,
    step: 1,
    className: "w-[300px]",
  },
};

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    max: 100,
    step: 1,
    className: "w-[300px]",
  },
};

export const WithSteps: Story = {
  args: {
    defaultValue: [20],
    max: 100,
    step: 10,
    className: "w-[300px]",
  },
};

export const Controlled: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
    className: "w-[300px]",
  },
  render: (args) => {
    const [value, setValue] = useState([50]);

    return (
      <div className="flex flex-col gap-4">
        <Slider
          {...args}
          value={value}
          onValueChange={(newValue) => {
            setValue(newValue);

            args.onValueChange?.(newValue);
          }}
        />
        <div className="text-sm text-muted-foreground">
          Value: {value.join(", ")}
        </div>
      </div>
    );
  },
};

export const Vertical: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    orientation: "vertical",
    className: "min-h-[200px]",
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: [33],
    disabled: true,
    className: "w-[300px]",
  },
};
