import type { Meta, StoryObj } from "@storybook/react";

import { Progress } from "./progress";

const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  parameters: {
    docs: {
      description: {
        component: "A progress component for showing completion status.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

import { useEffect, useState } from "react";

export const Default: Story = {
  render: () => <Progress value={33} className="w-[60%]" />,
};

export const Simulated: Story = {
  render: () => {
    const [progress, setProgress] = useState(13);

    useEffect(() => {
      const timer = setTimeout(() => setProgress(66), 500);
      return () => clearTimeout(timer);
    }, []);

    return <Progress value={progress} className="w-[60%]" />;
  },
};
