import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Toggle } from "./toggle";

const meta: Meta<typeof Toggle> = {
  title: "Components/Toggle",
  component: Toggle,
  parameters: {
    docs: {
      description: {
        component: "A rich and a simple toggle component for on/off states.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["default", "outline"],
      description: "Applies to the button variant only.",
    },
    size: {
      control: "radio",
      options: ["default", "sm", "lg"],
      description: "Applies to the button variant only.",
    },
    label: {
      control: "text",
      description: "The primary text for the toggle.",
    },
    description: {
      control: "text",
      description:
        "If provided along with an `icon`, renders the 'card' variant.",
    },
    icon: {
      control: "text",
      description:
        "If provided along with a `description`, renders the 'card' variant. Uses Material Symbols names.",
    },
    isActive: {
      control: "boolean",
      description: "Determines the 'on' or 'off' state of the toggle.",
    },
    onClick: {
      action: "clicked",
      description: "Callback function when the toggle is pressed.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveToggle = (args: React.ComponentProps<typeof Toggle>) => {
  const [isActive, setIsActive] = React.useState(args.isActive || false);
  return (
    <Toggle
      {...args}
      isActive={isActive}
      onClick={() => setIsActive(!isActive)}
    />
  );
};

export const DefaultButton: Story = {
  args: {
    label: "Toggle Me",
    variant: "default",
    size: "default",
    isActive: false,
  },
  render: InteractiveToggle,
};

export const OutlineButton: Story = {
  args: {
    label: "Outline",
    variant: "outline",
    size: "default",
    isActive: false,
  },
  render: InteractiveToggle,
};

export const ActiveButton: Story = {
  args: {
    label: "Active",
    variant: "default",
    size: "default",
    isActive: true,
  },
  render: InteractiveToggle,
};

export const ButtonSizes: Story = {
  render: () => {
    const [isActiveSm, setIsActiveSm] = React.useState(false);
    const [isActiveDefault, setIsActiveDefault] = React.useState(false);
    const [isActiveLg, setIsActiveLg] = React.useState(false);

    return (
      <div className="flex items-center gap-4">
        <Toggle
          label="Small"
          size="sm"
          isActive={isActiveSm}
          onClick={() => setIsActiveSm(!isActiveSm)}
        />
        <Toggle
          label="Default"
          size="default"
          isActive={isActiveDefault}
          onClick={() => setIsActiveDefault(!isActiveDefault)}
        />
        <Toggle
          label="Large"
          size="lg"
          isActive={isActiveLg}
          onClick={() => setIsActiveLg(!isActiveLg)}
        />
      </div>
    );
  },
};

export const ToggleCard: Story = {
  args: {
    label: "Enable Notifications",
    description: "Get updates about new features.",
    icon: "notifications",
    isActive: false,
  },
  render: InteractiveToggle,
};

export const ActiveToggleCard: Story = {
  args: {
    label: "Notifications Enabled",
    description: "You will receive updates.",
    icon: "check_circle",
    isActive: true,
  },
  render: InteractiveToggle,
};
