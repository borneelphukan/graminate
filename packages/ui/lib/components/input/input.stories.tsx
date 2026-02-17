import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Input } from "./input";
import type { CountryCode } from "@/types";

const COUNTRY_CODES: CountryCode[] = [
  { flag: "🇺🇸", code: "+1", label: "United States" },
  { flag: "🇩🇪", code: "+49", label: "Germany" },
  { flag: "🇬🇧", code: "+44", label: "United Kingdom" },
  { flag: "🇫🇷", code: "+33", label: "France" },
  { flag: "🇯🇵", code: "+81", label: "Japan" },
  { flag: "🇨🇦", code: "+1", label: "Canada" },
  { flag: "🇦🇺", code: "+61", label: "Australia" },
  { flag: "🇮🇳", code: "+91", label: "India" },
];

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "An enhanced input component supporting various types, icons, dropdowns, and validation states.",
      },
    },
    layout: "centered",
  },
  argTypes: {
    value: {
      control: "text",
      description: "The controlled value of the input.",
    },
    defaultValue: {
      control: "text",
      description: "The default value for uncontrolled state.",
    },
    label: {
      control: "text",
      description: "The label text for the input.",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text found inside the input.",
    },
    hint: {
      control: "text",
      description: "Helper text displayed below the input.",
    },
    error: {
      control: "text",
      description:
        "Error message displayed below the input. Changes border color to red.",
    },
    disabled: {
      control: "boolean",
      description: "Disables the input field.",
    },
    hideLabel: {
      control: "boolean",
      description:
        "Visually hides the label but keeps it accessible for screen readers.",
    },
    type: {
      control: "select",
      options: ["text", "password", "email", "number", "tel", "url"],
      description: "The HTML type attribute of the input.",
    },
    onChange: {
      action: "changed",
      description: "Callback function when the input value changes.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    id: "default-input",
    label: "Email Address",
    placeholder: "user@example.com",
  },
};

export const WithValue: Story = {
  args: {
    id: "value-input",
    label: "Username",
    defaultValue: "johndoe",
  },
};

export const Controlled: Story = {
  args: {
    id: "controlled-input",
    label: "Controlled Input",
    hint: "This input's state is managed by React state.",
  },
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Input
        {...args}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          args.onChange?.(e);
        }}
      />
    );
  },
};

export const WithHint: Story = {
  args: {
    id: "hint-input",
    label: "Password",
    type: "password",
    hint: "Must be at least 8 characters long.",
  },
};

export const WithError: Story = {
  args: {
    id: "error-input",
    label: "Username",
    defaultValue: "invalid_user!",
    error: "Special characters are not allowed.",
    icon: { right: "warning" },
  },
};

export const Disabled: Story = {
  args: {
    id: "disabled-input",
    label: "Disabled Input",
    defaultValue: "Cannot change this",
    disabled: true,
    icon: { left: "lock" },
  },
};

export const WithIcons: Story = {
  args: {
    id: "icons-input",
    label: "Search",
    placeholder: "Search...",
    icon: {
      left: "search",
      right: "info",
    },
  },
};

export const Password: Story = {
  args: {
    id: "password-input",
    label: "Password",
    type: "password",
    hint: "Click the eye icon to toggle visibility",
  },
};

export const HiddenLabel: Story = {
  args: {
    id: "hidden-label-input",
    label: "Search",
    hideLabel: true,
    placeholder: "Search (Label is visually hidden)",
    icon: { left: "search" },
  },
};

export const WithInputButton: Story = {
  args: {
    id: "input-button",
    label: "Referral Code",
    defaultValue: "X89-220-CC",
    readOnly: true,
    inputButton: {
      label: "Copy",
      onClick: () => alert("Copied!"),
    },
  },
};

export const WithDropdownLeft: Story = {
  render: (args) => {
    const [protocol, setProtocol] = useState("https://");

    return (
      <Input
        {...args}
        id="dropdown-left"
        label="Website URL"
        placeholder="example.com"
        dropdown={{
          left: {
            value: protocol,
            options: [
              { label: "https://", value: "https://" },
              { label: "http://", value: "http://" },
              { label: "ftp://", value: "ftp://" },
            ],
            onSelect: (value) => setProtocol(value),
          },
        }}
      />
    );
  },
};

export const WithDropdownRight: Story = {
  render: (args) => {
    const [currency, setCurrency] = useState("USD");

    return (
      <Input
        {...args}
        id="dropdown-right"
        label="Amount"
        type="number"
        placeholder="0.00"
        dropdown={{
          right: {
            value: currency,
            options: [
              { label: "USD", value: "USD" },
              { label: "EUR", value: "EUR" },
              { label: "GBP", value: "GBP" },
              { label: "JPY", value: "JPY" },
            ],
            onSelect: (value) => setCurrency(value),
          },
        }}
      />
    );
  },
};

export const WithBothDropdowns: Story = {
  render: (args) => {
    const [protocol, setProtocol] = useState("https://");
    const [domain, setDomain] = useState(".com");

    return (
      <Input
        {...args}
        id="dropdown-both"
        label="Domain"
        placeholder="example"
        dropdown={{
          left: {
            value: protocol,
            options: [
              { label: "https://", value: "https://" },
              { label: "http://", value: "http://" },
            ],
            onSelect: (value) => setProtocol(value),
          },
          right: {
            value: domain,
            options: [
              { label: ".com", value: ".com" },
              { label: ".net", value: ".net" },
              { label: ".org", value: ".org" },
              { label: ".io", value: ".io" },
            ],
            onSelect: (value) => setDomain(value),
          },
        }}
      />
    );
  },
};

export const TelephoneWithCountryCode: Story = {
  render: (args) => {
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
      COUNTRY_CODES[0]
    );
    const [phone, setPhone] = useState("");

    return (
      <Input
        {...args}
        id="phone-country"
        label="Phone Number"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        countryCode={{
          selected: selectedCountry,
          options: COUNTRY_CODES,
          onSelect: (country) => setSelectedCountry(country),
        }}
        placeholder="Enter phone number"
        hint={`Selected: ${selectedCountry.label}`}
      />
    );
  },
};

export const RoleSelector: Story = {
  render: (args) => {
    const roleOptions = ["Worker", "Manager", "Director", "Owner"];
    const [selectedRole, setSelectedRole] = useState(roleOptions[1]);

    return (
      <Input
        {...args}
        id="role-selector"
        label="Role Selector"
        hint="Use up/down arrows to change role"
        options={roleOptions}
        selectedOption={selectedRole}
        onOptionChange={(opt) => setSelectedRole(opt)}
        value={roleOptions.indexOf(selectedRole)}
        readOnly
      />
    );
  },
};
