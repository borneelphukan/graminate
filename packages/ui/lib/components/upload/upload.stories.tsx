import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Upload } from "./upload";

const meta: Meta<typeof Upload> = {
  title: "Components/Upload",
  component: Upload,
  tags: ["autodocs"],
  argTypes: {
    onValueChange: { action: "changed" },
  },
};

export default meta;
type Story = StoryObj<typeof Upload>;

export const Default: Story = {
  render: (args) => {
    const [files, setFiles] = React.useState<File[]>([]);
    return (
      <Upload
        {...args}
        value={files}
        onValueChange={setFiles}
        className="w-[500px]"
      />
    );
  },
  args: {
    maxSizeInMB: 5,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  },
};

export const Multiple: Story = {
  render: (args) => {
    const [files, setFiles] = React.useState<File[]>([]);
    return (
      <Upload
        {...args}
        value={files}
        onValueChange={setFiles}
        className="w-[500px]"
      />
    );
  },
  args: {
    multiple: true,
    maxSizeInMB: 10,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
  },
};

export const WithInitialFiles: Story = {
  render: (args) => {
    const [files, setFiles] = React.useState<File[]>([
      new File(["content"], "example.pdf", { type: "application/pdf" }),
      new File(["image content"], "image.png", { type: "image/png" }),
    ]);
    return (
      <Upload
        {...args}
        value={files}
        onValueChange={setFiles}
        className="w-[500px]"
      />
    );
  },
  args: {
    multiple: true,
  },
};
