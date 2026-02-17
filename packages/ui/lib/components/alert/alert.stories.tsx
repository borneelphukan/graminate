import type { Meta, StoryObj } from "@storybook/react";

import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "../button/button";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    docs: {
      description: {
        component:
          "An alert component for displaying important messages. For more information, see the [shadcn/ui Alert documentation](https://ui.shadcn.com/docs/components/alert).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  ),
};

export const Error: Story = {
  render: () => (
    <Alert variant="error">
      <AlertDescription>
        Your Hiring Request has been rejected by the Agency
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert variant="success">
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertDescription>
        Worker reaches Equal Pay in the next 10 days
      </AlertDescription>
    </Alert>
  ),
};

export const Neutral: Story = {
  render: () => (
    <Alert variant="neutral">
      <AlertDescription>
        Select one or more service providers and assign a priority.
      </AlertDescription>
    </Alert>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertDescription className="w-full flex items-center justify-between">
        <span>
          This worker was deregistered by the Agency. You can either confirm or
          replace the worker.
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" label="Confirm" />
          <Button label="Replace Position" className="bg-[#14786e]" />
        </div>
      </AlertDescription>
    </Alert>
  ),
};
