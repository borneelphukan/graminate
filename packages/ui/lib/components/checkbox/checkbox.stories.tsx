import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component: "A checkbox component for boolean inputs.",
      },
    },
  },
  argTypes: {
    label: {
      control: "text",
      description: "The label content for the checkbox.",
    },
    hint: {
      control: "text",
      description: "An optional hint message displayed below the label.",
    },
    error: {
      control: "text",
      description: "An optional error message to display.",
    },
    disabled: {
      control: "boolean",
      description: "Disables the checkbox.",
    },
    checked: {
      control: "boolean",
      description:
        "The controlled checked state of the checkbox. Must be used with `onCheckedChange`.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Accept terms and conditions",
  },
};

export const WithHint: Story = {
  args: {
    label: "Subscribe to our newsletter",
    hint: "You will receive weekly updates on new products.",
  },
};

export const WithError: Story = {
  args: {
    label: "I agree to the privacy policy",
    error: "You must accept the policy to continue.",
  },
};

export const Disabled: Story = {
  render: (args) => (
    <div className="flex flex-col space-y-4">
      <Checkbox {...args} label="Cannot be selected (unchecked)" disabled />
      <Checkbox
        {...args}
        label="Cannot be deselected (checked)"
        disabled
        defaultChecked
      />
    </div>
  ),
};

export const CheckedByDefault: Story = {
  args: {
    label: "This option is enabled by default",
    defaultChecked: true,
  },
};
