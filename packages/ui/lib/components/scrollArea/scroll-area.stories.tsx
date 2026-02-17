import type { Meta, StoryObj } from "@storybook/react";

import { ScrollArea, ScrollBar } from "./scroll-area";

const meta: Meta<typeof ScrollArea> = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  parameters: {
    docs: {
      description: {
        component: "A scroll area component for custom scrollable content.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
      <div className="space-y-4">
        <h4 className="text-sm font-medium leading-none">Tags</h4>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="text-sm">
            Tag {i + 1}
          </div>
        ))}
      </div>
      <ScrollBar />
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 50 }).map((_, i) => (
          <figure key={i} className="shrink-0">
            <div className="overflow-hidden rounded-md h-32 w-24 bg-secondary flex items-center justify-center">
              Item {i + 1}
            </div>
            <figcaption className="pt-2 text-xs text-muted-foreground w-24 text-center">
              Photo by User {i + 1}
            </figcaption>
          </figure>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};
