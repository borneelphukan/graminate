import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button/button";
import { Modal } from "./modal";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    showCloseButton: { control: "boolean" },
    content: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    title: "Edit profile",
    description:
      "Make changes to your profile here. Click save when you're done.",
    trigger: <Button>Open Modal</Button>,
    showCloseButton: true,
    content: (
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="name" className="text-right text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            defaultValue="Pedro Duarte"
            className="col-span-3 border p-2 rounded-md"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="username" className="text-right text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            defaultValue="@peduarte"
            className="col-span-3 border p-2 rounded-md"
          />
        </div>
      </div>
    ),
    actions: [
      <Button
        key="cancel"
        variant="secondary"
        onClick={() => console.log("Cancel clicked")}
      >
        Cancel
      </Button>,
      <Button key="save" onClick={() => console.log("Save clicked")}>
        Save changes
      </Button>,
    ],
  },
};

export const WithLongContent: Story = {
  args: {
    title: "Terms and Conditions",
    description: "Please read the following terms carefully.",
    trigger: <Button variant="outline">View Terms</Button>,
    showCloseButton: true,
    content: (
      <div className="text-sm text-muted-foreground space-y-4">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </p>
        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo.
        </p>
      </div>
    ),
    actions: [
      <Button key="close" variant="secondary">
        Close
      </Button>,
      <Button key="accept">I Accept</Button>,
    ],
  },
};

export const WithoutCloseButton: Story = {
  args: {
    ...Default.args,
    showCloseButton: false,
    trigger: <Button variant="destructive">No Close Button</Button>,
  },
};
