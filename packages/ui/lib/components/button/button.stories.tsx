import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "A versatile button component supporting multiple variants, sizes, shapes, and loading states. It can also render as a different element using `asChild`.",
      },
    },
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "ghost",
        "outline",
        "success",
        "destructive",
        "link",
      ],
      description: "The visual style of the button.",
    },
    size: {
      control: "radio",
      options: ["lg", "md", "sm", "icon"],
      description: "The size of the button.",
    },
    shape: {
      control: "radio",
      options: ["default", "circle"],
      description: "The shape of the button corners.",
    },
    label: {
      control: "text",
      description:
        "Text content to display inside the button. Can be used instead of children.",
    },
    children: {
      control: "text",
      description: "Button content. Can be text, icons, or other elements.",
    },
    isLoading: {
      control: "boolean",
      description: "Shows a loading spinner and disables interaction.",
    },
    disabled: {
      control: "boolean",
      description: "Disables the button.",
    },
    asChild: {
      control: "boolean",
      description:
        "Change the underlying element for the button (e.g. to an <a> tag).",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    onClick: {
      action: "clicked",
      description: "Click handler",
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "primary",
    label: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    label: "Secondary Button",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    label: "Outline Button",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    label: "Ghost Button",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    label: "Success Button",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    label: "Destructive Button",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    label: "Link Button",
  },
};

export const WithIconLeft: Story = {
  args: {
    variant: "primary",
    label: "Send Email",
    icon: { left: "mail" },
  },
};

export const WithIconRight: Story = {
  args: {
    variant: "secondary",
    label: "Next Step",
    icon: { right: "arrow_forward" },
  },
};

export const WithBothIcons: Story = {
  args: {
    variant: "outline",
    label: "Sync",
    icon: { left: "refresh", right: "cloud_sync" },
  },
};

export const IconOnly: Story = {
  args: {
    variant: "secondary",
    size: "icon",
    icon: { left: "settings" },
    label: "Settings", // Accessible label
  },
};

export const IconOnlyCircle: Story = {
  args: {
    variant: "ghost",
    size: "icon",
    shape: "circle",
    icon: { left: "close" },
    label: "Close",
  },
};

export const Loading: Story = {
  args: {
    variant: "primary",
    label: "Submitting",
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    label: "Disabled Button",
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    label: "Small Button",
    variant: "secondary",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    label: "Large Button",
    variant: "primary",
  },
};
