import type { Meta, StoryObj } from "@storybook/react";
import { Layout } from "./layout";

const meta: Meta<typeof Layout> = {
  title: "Design System/Layout",
  component: Layout,
  argTypes: {
    variant: {
      options: ["vertical", "horizontal"],
      control: { type: "radio" },
    },
  },
};

export default meta;

const Block = ({ title, color }: { title: string; color: string }) => (
  <div
    style={{
      width: "2rem",
      height: "2rem",
      backgroundColor: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
    }}
  >
    {title}
  </div>
);

const Children = () => (
  <>
    <Block title="A" color="#52EFBA" />
    <Block title="B" color="#6025E1" />
    <Block title="C" color="#FE5E00" />
  </>
);

type Story = StoryObj<typeof Layout>;

export const Vertical: Story = {
  args: {
    children: <Children />,
    variant: "vertical",
  },
};

export const Horizontal: Story = {
  args: {
    children: <Children />,
    variant: "horizontal",
  },
};
