import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "./switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          "A switch component for toggling a boolean state. It can be controlled by passing `checked` and `onChange` props, or uncontrolled by passing `defaultChecked`.",
      },
    },
    layout: "centered",
  },
  argTypes: {
    checked: {
      control: "boolean",
      description:
        "If provided, the component will be in a controlled state. You must manage its state via `onChange`.",
    },
    defaultChecked: {
      control: "boolean",
      description:
        "The initial checked state for an uncontrolled component. Use this to make the switch interactive in Storybook without a render function.",
    },
    onChange: {
      action: "changed",
      description: "Callback function when the switch value changes.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    id: "default-switch",
    label: "Enable notifications",
    defaultChecked: false,
  },
};

export const DefaultChecked: Story = {
  args: {
    id: "default-checked-switch",
    label: "Feature enabled",
    defaultChecked: true,
  },
};

export const Controlled: Story = {
  args: {
    id: "controlled-switch",
    label: "Controlled Component",
    hint: "This switch's state is managed by its parent.",
  },
  render: (args) => {
    const [isChecked, setIsChecked] = useState(false);

    return (
      <Switch
        {...args}
        checked={isChecked}
        onChange={(newCheckedState) => {
          setIsChecked(newCheckedState);
          args.onChange?.(newCheckedState);
        }}
      />
    );
  },
};

export const WithHint: Story = {
  args: {
    id: "hint-switch",
    label: "Allow email updates",
    hint: "We'll only send you important updates.",
    defaultChecked: false,
  },
};

export const WithError: Story = {
  args: {
    id: "error-switch",
    label: "I agree to the terms",
    error: "You must agree to the terms and conditions.",
    defaultChecked: false,
  },
};

export const Disabled: Story = {
  args: {
    id: "disabled-switch",
    label: "Cannot enable",
    disabled: true,
    checked: false,
  },
};

export const DisabledChecked: Story = {
  args: {
    id: "disabled-checked-switch",
    label: "Cannot disable",
    disabled: true,
    checked: true,
  },
};

export const HiddenLabel: Story = {
  args: {
    id: "hidden-label-switch",
    label: "Enable dark mode",
    hideLabel: true,
    defaultChecked: false,
  },
};
