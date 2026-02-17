import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const CardDemo = () => (
  <Card className="w-[350px]">
    <CardHeader>
      <CardTitle>Create project</CardTitle>
      <CardDescription>Deploy your new project in one-click.</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Card Content</p>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Button variant="secondary">Cancel</Button>
      <Button>Deploy</Button>
    </CardFooter>
  </Card>
);

const meta: Meta<typeof CardDemo> = {
  title: "Components/Card",
  component: CardDemo,
  parameters: {
    docs: {
      description: {
        component:
          "A card component for content containers. For more information, see the [shadcn/ui Card documentation](https://ui.shadcn.com/docs/components/card).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
