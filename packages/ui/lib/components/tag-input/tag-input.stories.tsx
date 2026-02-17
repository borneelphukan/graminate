import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { TagInput } from "./tag-input";

const meta = {
  title: "Components/TagInput",
  component: TagInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A tag input component that supports both free-text entry and dropdown selection.",
      },
    },
  },
  args: {
    value: [],
    onChange: () => {},
  },
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const BasicDemo = (
  args: Omit<React.ComponentProps<typeof TagInput>, "id" | "value" | "onChange">
) => {
  const [tags, setTags] = useState<string[]>(["React", "TypeScript"]);
  return (
    <div className="flex flex-col gap-8 max-w-sm">
      <TagInput
        {...args}
        id="basic-tag-input"
        value={tags}
        onChange={setTags}
        hint="Type a skill and press Enter to add it."
      />
    </div>
  );
};

const ValidationDemo = (
  args: Omit<React.ComponentProps<typeof TagInput>, "id" | "value" | "onChange">
) => {
  const [emails, setEmails] = useState<string[]>([]);
  const validateEmail = (tag: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tag);
  };

  return (
    <div className="flex flex-col gap-8 max-w-sm">
      <TagInput
        {...args}
        id="validation-tag-input"
        label="Recipient Emails"
        placeholder="name@company.com"
        value={emails}
        onChange={setEmails}
        validate={validateEmail}
        hint="Enter valid email addresses only."
      />
    </div>
  );
};

const LimitDemo = (
  args: Omit<React.ComponentProps<typeof TagInput>, "id" | "value" | "onChange">
) => {
  const [categories, setCategories] = useState<string[]>(["Design"]);
  const MAX_TAGS = 3;

  return (
    <div className="flex flex-col gap-8 max-w-sm">
      <TagInput
        {...args}
        id="limit-tag-input"
        label={`Categories (Max ${MAX_TAGS})`}
        placeholder="Add category..."
        value={categories}
        onChange={setCategories}
        error={
          categories.length > MAX_TAGS
            ? `Please select a maximum of ${MAX_TAGS} categories.`
            : undefined
        }
      />
    </div>
  );
};

const DisabledDemo = (
  args: Omit<React.ComponentProps<typeof TagInput>, "id" | "value" | "onChange">
) => {
  return (
    <div className="flex flex-col gap-8 max-w-sm">
      <TagInput
        {...args}
        id="disabled-tag-input"
        label="System Tags"
        value={["Admin", "ReadOnly"]}
        onChange={() => {}}
        disabled
        hint="These tags cannot be changed."
      />
    </div>
  );
};

const DropdownDemo = (
  args: Omit<React.ComponentProps<typeof TagInput>, "id" | "value" | "onChange">
) => {
  const [fruits, setFruits] = useState<string[]>([]);
  const AVAILABLE_OPTIONS = [
    "Apple",
    "Banana",
    "Cherry",
    "Date",
    "Elderberry",
    "Fig",
    "Grape",
    "Honeydew",
  ];

  return (
    <div className="flex flex-col gap-8 max-w-sm">
      <TagInput
        {...args}
        id="dropdown-tag-input"
        label="Favorite Fruits"
        placeholder="Select a fruit..."
        value={fruits}
        onChange={setFruits}
        options={AVAILABLE_OPTIONS}
        hint="Select fruits from the dropdown or type to filter."
      />
    </div>
  );
};

const AutocompleteDemo = (
  args: Omit<React.ComponentProps<typeof TagInput>, "id" | "value" | "onChange">
) => {
  const [people, setPeople] = useState<string[]>([]);
  const PEOPLE_OPTIONS = [
    "Amelie Schlüter",
    "Jonathan Heuser",
    "Max Mustermann",
    "Erika Musterfrau",
    "John Doe",
    "Jane Doe",
  ];

  return (
    <div className="flex flex-col gap-8 max-w-sm">
      <TagInput
        {...args}
        id="autocomplete-tag-input"
        label="Contact Person"
        placeholder="Type to search..."
        value={people}
        onChange={setPeople}
        options={PEOPLE_OPTIONS}
        hint="Type to filter options."
      />
    </div>
  );
};

export const Basic: Story = {
  render: ({ id, value, onChange, ...args }) => <BasicDemo {...args} />,
  args: {
    label: "Skills",
    placeholder: "Type and press enter...",
    id: "basic-story",
  },
};

export const WithValidation: Story = {
  render: ({ id, value, onChange, ...args }) => <ValidationDemo {...args} />,
  args: {
    label: "Recipient Emails",
    id: "validation-story",
  },
};

export const MaxTagsLimit: Story = {
  render: ({ id, value, onChange, ...args }) => <LimitDemo {...args} />,
  args: {
    label: "Categories",
    id: "limit-story",
  },
};

export const Disabled: Story = {
  render: ({ id, value, onChange, ...args }) => <DisabledDemo {...args} />,
  args: {
    label: "System Tags",
    id: "disabled-story",
  },
};

export const DropdownMode: Story = {
  render: ({ id, value, onChange, ...args }) => <DropdownDemo {...args} />,
  args: {
    label: "Favorite Fruits",
    id: "dropdown-story",
  },
};

export const Autocomplete: Story = {
  render: ({ id, value, onChange, ...args }) => <AutocompleteDemo {...args} />,
  args: {
    label: "Contact Person",
    id: "autocomplete-story",
  },
};
