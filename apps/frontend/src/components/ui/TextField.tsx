import { Input } from "@graminate/ui";
import React from "react";

type TextFieldProps = {
  label: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  errorMessage?: string;
  isLoading?: boolean;
  onFocus?: () => void;
  calendar?: boolean;
  required?: boolean;
  password?: boolean;
  width?: string;
};

const TextField = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  errorMessage,
  isLoading,
  onFocus,
  calendar,
  required,
  password,
  width
}: TextFieldProps) => {
  // Generate a reasonably unique ID based on the label if it's a string
  const generatedId = typeof label === "string" 
    ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") 
    : `input-${Math.random().toString(36).substr(2, 9)}`;

  const finalType = password ? "password" : (calendar ? "date" : type);

  return (
    <Input
      id={generatedId}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={finalType}
      error={errorMessage}
      required={required}
      onFocus={onFocus}
    />
  );
};

export default TextField;
