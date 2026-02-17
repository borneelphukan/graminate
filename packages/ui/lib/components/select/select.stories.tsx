import type { Meta, StoryObj } from "@storybook/react";

import { Select } from "./select";
import { useState } from "react";
import { Input } from "../input/input.tsx";

const meta: Meta<typeof Select> = {
  title: "Design System/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component: "A select component for dropdown selections.",
      },
    },
  },
  argTypes: {
    multiple: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    hideLabel: {
      control: "boolean",
    },
    label: {
      control: "text",
    },
    hint: {
      control: "text",
    },
    error: {
      control: "text",
    },
    triggerPlaceholder: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<Record<string, unknown>>;

type InnerValue = { label: string; value: string };

const STANDARD_VALUES: InnerValue[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
  { label: "Grapes", value: "grapes" },
  { label: "Pineapple", value: "pineapple" },
  { label: "Strawberry", value: "strawberry" },
  { label: "Watermelon", value: "watermelon" },
];

const GROUPED_VALUES = [
  {
    groupName: "Citrus",
    values: [
      { label: "Orange", value: "orange" },
      { label: "Lemon", value: "lemon" },
      { label: "Lime", value: "lime" },
    ],
  },
  {
    groupName: null,
    values: [
      { label: "Strawberry", value: "strawberry" },
      { label: "Blueberry", value: "blueberry" },
      { label: "Raspberry", value: "raspberry" },
    ],
  },
  {
    groupName: "Tropical",
    values: [
      { label: "Mango", value: "mango" },
      { label: "Pineapple", value: "pineapple" },
      { label: "Papaya", value: "papaya" },
      { label: "Kiwi", value: "kiwi" },
    ],
  },
];

export const Default: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <Select
        id="default-select"
        iconLeft="fragrance"
        label="Fruits"
        values={STANDARD_VALUES}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};

export const WithPlaceholder: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <Select
        id="placeholder-select"
        label="Fruits"
        triggerPlaceholder="Select your favorite fruit..."
        values={STANDARD_VALUES}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};
export const WithGroups: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <Select
        id="grouped-select"
        iconLeft="fragrance"
        label="Fruits"
        values={GROUPED_VALUES}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};
export const WithHint: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <Select
        id="hint-select"
        label="Fruits"
        values={STANDARD_VALUES}
        value={value}
        onValueChange={setValue}
        hint="Please select one fruit from the list."
      />
    );
  },
};
export const WithError: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <Select
        id="error-select"
        label="Fruits"
        values={STANDARD_VALUES}
        value={value}
        onValueChange={setValue}
        error="This field is required."
      />
    );
  },
};
export const Disabled: Story = {
  args: {},
  render: () => (
    <Select
      id="disabled-select"
      iconLeft="no_food"
      label="Fruits"
      values={STANDARD_VALUES}
      disabled
    />
  ),
};
export const WithInput: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <div className="flex flex-row gap-4">
        <Select
          id="with-input-select"
          label={"Fruits"}
          values={GROUPED_VALUES}
          value={value}
          onValueChange={setValue}
        />
        <Input id="quantity" label={"Quantity"} placeholder="Enter quantity" />
      </div>
    );
  },
};
export const MultiSelect: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <Select
        id="multi-select"
        label="Fruits (Multiple)"
        triggerPlaceholder="Select one or more fruits"
        values={STANDARD_VALUES}
        multiple
        value={value}
        onValueChange={setValue}
      />
    );
  },
};
export const MultiSelectWithGroups: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <Select
        id="multi-grouped-select"
        label="Fruits (Multiple, Grouped)"
        triggerPlaceholder="Select one or more fruits"
        values={GROUPED_VALUES}
        multiple
        value={value}
        onValueChange={setValue}
      />
    );
  },
};
export const MultiSelectWithCustomFormatter: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <Select
        id="multi-formatter-select"
        label="Fruits (Custom Formatter)"
        triggerPlaceholder="Select fruits"
        values={STANDARD_VALUES}
        multiple
        value={value}
        onValueChange={setValue}
        multiDisplayFormatter={(selectedValues, allValues) => {
          if (selectedValues.length === 0) {
            return "No fruits selected";
          }
          if (selectedValues.length === 1) {
            const label = allValues.find(
              (v) => v.value === selectedValues[0]
            )?.label;
            return `Just one: ${label}`;
          }
          return (
            <span className="font-bold text-green-700">
              {`${selectedValues.length} fruits selected!`}
            </span>
          );
        }}
      />
    );
  },
};
