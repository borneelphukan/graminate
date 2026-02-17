import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./tooltip.tsx";

const cn = (...inputs: (string | boolean | undefined | null)[]) => {
  return inputs.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
};

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
      "ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900",
      "h-10 px-4 py-2",
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="flex min-h-[250px] min-w-[400px] items-center justify-center p-10">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
      description:
        "The preferred side of the trigger to render the tooltip on.",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button>Hover Me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a default tooltip.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithHeaderAndContent: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button>Hover Me (Header/Content)</Button>
      </TooltipTrigger>
      <TooltipContent
        header="Tooltip Header"
        content="This tooltip has a dedicated header and content section."
      />
    </Tooltip>
  ),
};

export const SideTop: Story = {
  args: {
    side: "top",
  },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button>Side: Top</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tooltip on the top.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const SideRight: Story = {
  args: {
    side: "right",
  },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button>Side: Right</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tooltip on the right.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const SideBottom: Story = {
  args: {
    side: "bottom",
  },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button>Side: Bottom</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tooltip on the bottom.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const SideLeft: Story = {
  args: {
    side: "left",
  },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button>Side: Left</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tooltip on the left.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const AllSides: Story = {
  render: () => (
    <div className="grid w-64 grid-cols-3 place-items-center gap-6">
      <div />
      <Tooltip side="top">
        <TooltipTrigger asChild>
          <Button>Top</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tooltip on the top.</p>
        </TooltipContent>
      </Tooltip>
      <div />

      <Tooltip side="left">
        <TooltipTrigger asChild>
          <Button>Left</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tooltip on the left.</p>
        </TooltipContent>
      </Tooltip>
      <div className="h-10 w-10 rounded-full bg-gray-200" />
      <Tooltip side="right">
        <TooltipTrigger asChild>
          <Button>Right</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tooltip on the right.</p>
        </TooltipContent>
      </Tooltip>

      <div />
      <Tooltip side="bottom">
        <TooltipTrigger asChild>
          <Button>Bottom</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tooltip on the bottom.</p>
        </TooltipContent>
      </Tooltip>
      <div />
    </div>
  ),
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="flex min-h-[350px] items-center justify-center p-10">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
};

export const WithDelay: Story = {
  render: (args) => (
    <TooltipProvider delayDuration={500}>
      <Tooltip {...args}>
        <TooltipTrigger asChild>
          <Button>Hover Me (500ms Delay)</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This tooltip appeared after a 500ms delay.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  decorators: [
    (Story) => (
      <div className="flex min-h-[250px] items-center justify-center p-10">
        <Story />
      </div>
    ),
  ],
};
