import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An image element with a fallback for representing the user. Includes support for avatar groups.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/broken-image.jpg" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const CustomSize: Story = {
  render: (args) => (
    <div className="flex gap-4 items-center">
      <Avatar {...args} className="w-6 h-6 text-xs">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>XS</AvatarFallback>
      </Avatar>
      <Avatar {...args}>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar {...args} className="w-12 h-12 text-lg">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
      <Avatar {...args} className="w-16 h-16 text-xl">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>XL</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Group = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://github.com/google.png" alt="@google" />
        <AvatarFallback>GO</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    </AvatarGroup>
  ),
};

export const GroupWithLimit = {
  render: () => (
    <AvatarGroup limit={3}>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://github.com/google.png" alt="@google" />
        <AvatarFallback>GO</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>XY</AvatarFallback>
      </Avatar>
    </AvatarGroup>
  ),
};
