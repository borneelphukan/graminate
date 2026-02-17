import type { Meta, StoryObj } from "@storybook/react";

import { AspectRatio } from "./aspect-ratio";

const AspectRatioDemo = () => (
  <div className="w-[450px]">
    <AspectRatio ratio={16 / 9} className="bg-muted">
      <img
        src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
        alt="Photo by Drew Beamer"
        className="rounded-md object-cover"
      />
    </AspectRatio>
  </div>
);

const meta: Meta<typeof AspectRatioDemo> = {
  title: "Components/AspectRatio",
  component: AspectRatioDemo,
  parameters: {
    docs: {
      description: {
        component:
          "An aspect ratio component for maintaining consistent proportions. For more information, see the [shadcn/ui Aspect Ratio documentation](https://ui.shadcn.com/docs/components/aspect-ratio).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
