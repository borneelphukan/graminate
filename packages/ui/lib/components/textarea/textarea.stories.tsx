import type { Meta, StoryObj } from "@storybook/react";

import { TextArea } from "./textarea";

const meta: Meta<typeof TextArea> = {
  title: "Components/Textarea",
  component: TextArea,
  parameters: {
    docs: {
      description: {
        component:
          "A textarea component for multi-line text input, with support for labels, hints, errors, and disabled states.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Primary: Story = {
  args: {
    id: "primary-textarea",
    label: "Your Message",
    placeholder: "Type your message here...",
  },
};

export const WithHint: Story = {
  args: {
    id: "hint-textarea",
    label: "Your Message",
    placeholder: "Type your message here...",
    hint: "This is a helpful hint to guide the user.",
  },
};

export const WithError: Story = {
  args: {
    id: "error-textarea",
    label: "Your Message",
    placeholder: "Type your message here...",
    error: "This field is required.",
    defaultValue: "Some invalid input",
  },
};

export const Disabled: Story = {
  args: {
    id: "disabled-textarea",
    label: "Your Message",
    placeholder: "You can't type here",
    disabled: true,
  },
};

export const HiddenLabel: Story = {
  args: {
    id: "hidden-label-textarea",
    label: "Search",
    hideLabel: true,
    placeholder: "A placeholder is useful when the label is hidden...",
  },
};
