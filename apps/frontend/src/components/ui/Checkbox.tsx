import React, { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  id: string;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = ({
  label,
  id,
  className = "",
  checked,
  onCheckedChange,
  onChange,
  disabled,
  ...props
}: CheckboxProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onCheckedChange) onCheckedChange(e.target.checked);
  };

  return (
    <div className={`flex items-center ${className} ${disabled ? "opacity-50" : ""}`}>
      <input
        id={id}
        type="checkbox"
        className="hidden peer"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />
      <label 
        htmlFor={id} 
        className={`flex items-center ${disabled ? "cursor-not-allowed" : "cursor-pointer"} group`}
      >
        <div
          className={`
          w-4 h-4 flex items-center justify-center mr-2 rounded-sm border
          ${
            checked
              ? "border-green-200 bg-green-200 text-white"
              : "border-gray-300 bg-white dark:bg-gray-800"
          }
          relative transition-all duration-200
          ${!disabled && "group-hover:border-green-100"}
        `}
        >
          {checked && (
            <svg
              className="w-3 h-3 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        {label && (
          <span
            className={`
            text-dark dark:text-light text-sm
            ${checked ? "text-green-200 font-medium" : ""}
            transition-colors duration-200
          `}
          >
            {label}
          </span>
        )}
      </label>
    </div>
  );
};

export default Checkbox;
