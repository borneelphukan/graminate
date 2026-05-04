import { Tabs as RadixTabs } from "radix-ui";
import React, { type ReactNode } from "react";
import { Icon, type IconType } from "../icon/icon";

export type TabItemValue<T extends readonly TabItem[]> = T[number]["value"];

interface TabItem {
  value: string;
  label: ReactNode;
  content: React.ReactNode;
  icon?: IconType;
}

interface TabsProps<T extends readonly TabItem[]> {
  tabs: T;
  defaultTab?: TabItemValue<T>;
  activeTab?: TabItemValue<T>;
  onTabChange?: (tab: TabItemValue<T>) => void;
}

export const Tabs = <T extends readonly TabItem[]>({
  tabs,
  defaultTab,
  activeTab,
  onTabChange,
}: TabsProps<T>) => {
  return (
    <RadixTabs.Root
      defaultValue={defaultTab}
      value={activeTab}
      onValueChange={onTabChange}
      className="flex flex-col gap-2"
    >
      <RadixTabs.List className="flex overflow-auto">
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={`tab-trigger-${tab.value}`}
            value={tab.value}
            className="flex items-center justify-center gap-2 pt-2 pb-4 px-3 h-9 border-b border-gray-400 dark:border-gray-800 bg-none cursor-pointer relative text-sm text-neutral-gray transition-colors hover:text-neutral-black focus-visible:outline-2 focus-visible:border-none
            data-[state=active]:text-neutral-black data-[state=active]:font-medium data-[state=active]:border-black flex-1 whitespace-nowrap"
          >
            {tab.icon && <Icon type={tab.icon} />}
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {tabs.map((tab) => (
        <RadixTabs.Content key={`tab-content-${tab.value}`} value={tab.value}>
          {tab.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
};
