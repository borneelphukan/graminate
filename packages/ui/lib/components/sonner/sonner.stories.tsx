import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button/button";
import { Toaster, toast } from "./sonner";

const meta = {
  title: "Components/Toaster",
  component: Toaster,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minHeight: "600px", width: "100%", position: "relative" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

const BasicDemo = (args: React.ComponentProps<typeof Toaster>) => {
  return (
    <div className="flex flex-col gap-8 items-start">
      <Toaster {...args} />
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Usage</h3>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="secondary"
            onClick={() => toast("Event has been created")}
          >
            Default
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.message("Event has been created", {
                description: "Sunday, December 03, 2023 at 9:00 AM",
              })
            }
          >
            With Description
          </Button>
        </div>
      </section>
    </div>
  );
};

const StatesDemo = (args: React.ComponentProps<typeof Toaster>) => {
  return (
    <div className="flex flex-col gap-8 items-start">
      <Toaster {...args} />
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">States</h3>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="secondary"
            onClick={() => toast.success("Event has been created")}
          >
            Success
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.info("New event available")}
          >
            Info
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.warning("Event created with warnings")}
          >
            Warning
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.error("Event creation failed")}
          >
            Error
          </Button>
        </div>
      </section>
    </div>
  );
};

const ComplexDemo = (args: React.ComponentProps<typeof Toaster>) => {
  return (
    <div className="flex flex-col gap-8 items-start">
      <Toaster {...args} />
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Complex Examples</h3>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="secondary"
            onClick={() =>
              toast.success("Success", {
                label: "Q4",
                description: "Lorem ipsum",
              })
            }
          >
            With Label
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              toast.success("Success", {
                description: "Lorem ipsum",
                action: {
                  label: "Rückgängig",
                  onClick: () => console.log("Undo"),
                },
              })
            }
          >
            With Action
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              const promise = new Promise<{ name: string }>((resolve) =>
                setTimeout(() => resolve({ name: "Sonner" }), 2000)
              );
              toast.promise(promise, {
                loading: "Loading...",
                success: (data: { name: string }) => {
                  return `${data.name} toast has been added`;
                },
                error: "Error",
              });
            }}
          >
            Loading Promise
          </Button>
        </div>
      </section>
    </div>
  );
};

export const Basic: Story = {
  render: (args) => <BasicDemo {...args} />,
};

export const States: Story = {
  render: (args) => <StatesDemo {...args} />,
};

export const Complex: Story = {
  render: (args) => <ComplexDemo {...args} />,
};
