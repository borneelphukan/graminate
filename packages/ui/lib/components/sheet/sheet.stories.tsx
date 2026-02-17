import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button/button";
import { Input } from "../input/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const meta: Meta<typeof Sheet> = {
  title: "Components/Sheet",
  component: Sheet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Sheet>;

const SHEET_SIDES = ["top", "right", "bottom", "left"] as const;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" label="Open Sheet" />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="name"
            label="Name"
            defaultValue="Pedro Duarte"
            placeholder="Name"
          />
          <Input
            id="username"
            label="Username"
            defaultValue="@peduarte"
            placeholder="Username"
          />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" label="Cancel" />
          </SheetClose>
          <Button label="Save changes" />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const SideVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {SHEET_SIDES.map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline" label={side} className="capitalize" />
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>
                Make changes to your profile here. Click save when you're done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Input
                id={`name-${side}`}
                label="Name"
                defaultValue="Pedro Duarte"
                placeholder="Name"
              />
              <Input
                id={`username-${side}`}
                label="Username"
                defaultValue="@peduarte"
                placeholder="Username"
              />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline" label="Cancel" />
              </SheetClose>
              <Button label="Save changes" />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
};
