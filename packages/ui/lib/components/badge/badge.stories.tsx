import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    type: {
      options: [
        "default",
        "success",
        "error",
        "warning",
        "blue",
        "outline",
        "dotted",
      ],
      control: { type: "radio" },
    },
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "radio" },
    },
    iconLeft: {
      control: { type: "text" },
    },
    iconRight: {
      control: { type: "text" },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Badges are used to highlight status, attributes, or other information.",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const Group = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-neutral-gray">{title}</h3>
      <div className="flex flex-wrap gap-2 items-center">{children}</div>
    </div>
  );
};

const VariantsDemo = (args: React.ComponentProps<typeof Badge>) => {
  return (
    <div className="flex flex-col gap-6">
      <Group title="Default">
        <Badge {...args} type="default" label="Default" />
      </Group>
      <Group title="Success">
        <Badge {...args} type="success" label="Success" />
      </Group>
      <Group title="Error">
        <Badge {...args} type="error" label="Error" />
      </Group>
      <Group title="Warning">
        <Badge {...args} type="warning" label="Warning" />
      </Group>
      <Group title="Blue">
        <Badge {...args} type="blue" label="Blue" />
      </Group>
      <Group title="Outline">
        <Badge {...args} type="outline" label="Outline" />
      </Group>
      <Group title="Dotted">
        <Badge {...args} type="dotted" label="Dotted" />
      </Group>
    </div>
  );
};

const SizesDemo = (args: React.ComponentProps<typeof Badge>) => {
  return (
    <div className="flex flex-col gap-6">
      <Group title="Small">
        <Badge {...args} size="sm" label="Small Badge" />
      </Group>
      <Group title="Medium">
        <Badge {...args} size="md" label="Medium Badge" />
      </Group>
      <Group title="Large">
        <Badge {...args} size="lg" label="Large Badge" />
      </Group>
    </div>
  );
};

const IconsDemo = (args: React.ComponentProps<typeof Badge>) => {
  return (
    <div className="flex flex-col gap-6">
      <Group title="Left Icon">
        <Badge {...args} iconLeft="check" label="Verified" />
        <Badge {...args} type="blue" iconLeft="star" label="Featured" />
        <Badge {...args} type="warning" iconLeft="error" label="Warning" />
      </Group>
      <Group title="Right Icon">
        <Badge {...args} iconRight="arrow_forward" label="Next" />
        <Badge {...args} type="success" iconRight="check" label="Complete" />
        <Badge {...args} type="error" iconRight="close" label="Remove" />
      </Group>
      <Group title="Both Icons">
        <Badge
          {...args}
          iconLeft="calendar_today"
          iconRight="schedule"
          label="Meeting"
        />
      </Group>
    </div>
  );
};

export const Basic: Story = {
  args: {
    label: "Badge",
    type: "default",
    size: "md",
  },
};

export const Variants: Story = {
  render: (args) => <VariantsDemo {...args} />,
  args: {
    label: "Badge",
  },
};

export const Sizes: Story = {
  render: (args) => <SizesDemo {...args} />,
  args: {
    label: "Badge",
  },
};

export const WithIcons: Story = {
  render: (args) => <IconsDemo {...args} />,
  args: {
    label: "Badge",
  },
};
