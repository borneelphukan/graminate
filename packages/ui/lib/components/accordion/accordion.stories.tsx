import type { Meta, StoryObj } from "@storybook/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,

  parameters: {
    docs: {
      description: {
        component:
          "An accordion component for collapsible content sections. Supports text and card modes, subtitles, and standard accessible keyboard interactions.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Accordion type="single" collapsible className="w-full" {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other
          components&apos; aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It&apos;s animated by default, but you can disable it if you
          prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithSubtitle: Story = {
  render: (args) => (
    <Accordion type="single" collapsible className="w-full" {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger subtitle="Accessibility features">
          Is it accessible?
        </AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger subtitle="Styling options">
          Is it styled?
        </AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other
          components&apos; aesthetic.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const CardMode: Story = {
  render: (args) => (
    <Accordion
      type="single"
      collapsible
      mode="card"
      className="w-full"
      {...args}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger subtitle="Manage personal information">
          Personal Details
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>Name: John Doe</p>
            <p>Email: john@example.com</p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger subtitle="Configure application preferences">
          Settings
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm text-muted-foreground">
            Notification preferences, theme selection, and more.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger subtitle="View security logs">
          Security
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm text-muted-foreground">
            Last login: Today at 10:00 AM
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const MultipleOpen: Story = {
  render: (args) => (
    <Accordion type="multiple" className="w-full" {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>First Section</AccordionTrigger>
        <AccordionContent>
          You can open multiple sections at once.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second Section</AccordionTrigger>
        <AccordionContent>Try opening the first section too!</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Third Section</AccordionTrigger>
        <AccordionContent>
          All sections can be active simultaneously in this mode.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const DisabledItem: Story = {
  render: (args) => (
    <Accordion type="single" collapsible className="w-full" {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Enabled Item</AccordionTrigger>
        <AccordionContent>This item functions normally.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger>Disabled Item</AccordionTrigger>
        <AccordionContent>
          You cannot open this item because it is disabled.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Another Enabled Item</AccordionTrigger>
        <AccordionContent>This item works as expected.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
