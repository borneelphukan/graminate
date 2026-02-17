import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Tabs, type TabItemValue } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "Design System/Tabs",
  component: Tabs,
};

export default meta;

type Story = StoryObj<typeof Tabs>;

const tabsWithIcons = [
  {
    value: "grid",
    label: "Grid",
    icon: "grid_view",
    content: <p>Grid view content</p>,
  },
  {
    value: "list",
    label: "List",
    icon: "list",
    content: <p>List view content</p>,
  },
] as const;

export const MultipleTabs: Story = {
  render: () => <Tabs defaultTab="grid" tabs={tabsWithIcons} />,
};

const tabsWithoutIcons = [
  {
    value: "overview",
    label: "Overview",
    content: <p>Overview content</p>,
  },
  {
    value: "details",
    label: "Details",
    content: <p>Details content</p>,
  },
  {
    value: "settings",
    label: "Settings",
    content: <p>Settings content</p>,
  },
] as const;

export const ControlledWithoutIcons: Story = {
  render: () => {
    const [activeTab, setActiveTab] =
      useState<TabItemValue<typeof tabsWithoutIcons>>("details");

    return (
      <Tabs
        defaultTab={"overview"}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        tabs={tabsWithoutIcons}
      />
    );
  },
};
