import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../button/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

const AlertDialogDemo = () => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="secondary">Delete Account</Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your
          account and remove your data from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const meta: Meta<typeof AlertDialogDemo> = {
  title: "Components/AlertDialog",
  component: AlertDialogDemo,
  parameters: {
    docs: {
      description: {
        component:
          "An alert dialog component for important confirmations. For more information, see the [shadcn/ui Alert Dialog documentation](https://ui.shadcn.com/docs/components/alert-dialog).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
