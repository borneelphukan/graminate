import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "./icon";

const meta: Meta<typeof Icon> = {
  title: "Design System/Icon",
  component: Icon,
  argTypes: {
    color: {
      options: ["primary", "secondary"],
      control: { type: "radio" },
    },
    size: {
      options: ["lg", "md", "base", "sm"],
      control: { type: "radio" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Primary: Story = {
  args: {
    type: "pie_chart",
    size: "lg",
  },
};

export const Overview: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <Icon type="home" size="lg" color="primary" />
      <Icon type="home" size="md" color="primary" />
      <Icon
        type="home"
        size="base"
        color="primary"
        onClick={() => {
          alert("Hi!");
        }}
      />
      <Icon type="home" size="sm" color="primary" />
      <Icon type="settings" size="lg" color="secondary" />
      <Icon type="settings" size="md" color="secondary" />
      <Icon type="settings" size="base" color="secondary" />
      <Icon type="settings" size="sm" color="secondary" />
    </div>
  ),
};
