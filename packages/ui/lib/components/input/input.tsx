import { forwardRef, useState } from "react";

import { Icon, type IconType } from "../icon/icon";
import { Button } from "../button/button";
import { Layout } from "../layouts/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdownMenu/dropdownMenu";
import type { CountryCode } from "../../types";

type DropdownConfig = {
  value: React.ReactNode;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
};

type InputProps = React.ComponentPropsWithoutRef<"input"> & {
  id: string;
  label: React.ReactNode;
  icon?: {
    left?: IconType;
    right?: IconType;
  };
  dropdown?: {
    left?: DropdownConfig;
    right?: DropdownConfig;
  };
  inputButton?: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
  };
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  required?: boolean;
  options?: string[];
  selectedOption?: string;
  onOptionChange?: (option: string) => void;
  countryCode?: {
    selected: CountryCode;
    options: CountryCode[];
    onSelect: (country: CountryCode) => void;
  };
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      label,
      icon,
      dropdown,
      inputButton,
      hideLabel,
      hint,
      error,
      required,
      disabled,
      options,
      selectedOption,
      onOptionChange,
      countryCode,
      type,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const handleSelectorChange = (direction: "up" | "down") => {
      if (!options?.length || !onOptionChange || !selectedOption) return;

      const currentIndex = options.indexOf(selectedOption);
      if (currentIndex === -1) return;

      let nextIndex = 0;

      if (direction === "up") {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      } else {
        nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      }

      onOptionChange(options[nextIndex]);
    };

    const inputType = (() => {
      if (options) return "number";
      if (countryCode) return "tel";
      if (type === "password") return showPassword ? "text" : "password";
      return type;
    })();

    const isPasswordField = type === "password";

    return (
      <Layout
        ref={ref}
        className={disabled ? "cursor-not-allowed opacity-50" : ""}
      >
        <label
          className={`flex flex-col gap-1.5 group/input ${disabled ? "pointer-events-none" : ""}`}
          htmlFor={id}
        >
          <span
            className={
              hideLabel
                ? "sr-only"
                : "text-dark dark:text-light font-medium text-sm group-focus-within/input:text-neutral-dark-gray"
            }
          >
            {label}
            {required && <span className="text-red-200 ml-1">*</span>}
          </span>
          <div
            className={`flex flex-row gap-2 items-center py-2 px-3 rounded-lg border-1 border-gray-400 dark:border-gray-200 transition-colors ${
              error ? "border-red-200 group-focus-within/input:!ring-red-200" : "group-focus-within/input:!ring-green-200"
            } group-focus-within/input:!ring-[2px] dark:group-focus-within/input:!ring-offset-gray-200 group-focus-within/input:!ring-offset-2 ${className || ""}`}
          >
            {dropdown?.left && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-dark text-sm font-medium shrink-0 flex items-center gap-1 hover:text-neutral-dark-gray transition-colors focus:outline-none"
                  >
                    {dropdown.left.value}
                    <Icon type="arrow_drop_down" className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {dropdown.left.options.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => dropdown.left?.onSelect(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {countryCode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 pr-2 border-r border-neutral-light-gray/40 mr-2 text-sm font-medium hover:text-neutral-dark-gray transition-colors focus:outline-none"
                  >
                    <span>
                      {countryCode.selected.flag} {countryCode.selected.code}
                    </span>
                    <Icon type="arrow_drop_down" className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {countryCode.options.map((country) => (
                    <DropdownMenuItem
                      key={country.code}
                      onClick={() => countryCode.onSelect(country)}
                    >
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.label}</span>
                        <span className="text-dark">
                          {country.code}
                        </span>
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {icon?.left && (
              <Icon
                className="text-dark group-focus-within/input:text-neutral-dark-gray shrink-0"
                type={icon.left}
              />
            )}

            <input
              className={`border-none px-0.5 flex-1 w-full text-dark focus:outline-none focus:placeholder-neutral-dark-gray dark:text-light text-sm leading-none ${
                options ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" : ""
              }`}
              id={id}
              name={id}
              ref={ref}
              type={inputType}
              value={value}
              {...props}
            />

            {isPasswordField && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-dark hover:text-neutral-dark-gray transition-colors shrink-0 focus:outline-none"
                tabIndex={-1}
              >
                <Icon type={showPassword ? "visibility_off" : "visibility"} />
              </button>
            )}
            {icon?.right && !isPasswordField && (
              <Icon
                className="text-dark group-focus-within/input:text-dark shrink-0"
                type={icon.right}
              />
            )}
            {inputButton && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={inputButton.disabled}
                onClick={inputButton.onClick}
                label={inputButton.label}
              />
            )}

            {options && (
              <div className="flex flex-row items-center gap-2 shrink-0">
                <div className="flex flex-col gap-0 -my-1">
                  <button
                    type="button"
                    onClick={() => handleSelectorChange("up")}
                    tabIndex={-1}
                    className="text-dark hover:text-neutral-dark-gray active:text-brand-green transition-colors flex items-center justify-center h-3"
                  >
                    <Icon type="keyboard_arrow_up" className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectorChange("down")}
                    tabIndex={-1}
                    className="text-dark hover:text-neutral-dark-gray active:text-brand-green transition-colors flex items-center justify-center h-3"
                  >
                    <Icon type="keyboard_arrow_down" className="size-4" />
                  </button>
                </div>
                {selectedOption && (
                  <div className="text-black text-sm font-medium select-none min-w-[60px] text-right">
                    {selectedOption}
                  </div>
                )}
              </div>
            )}

            {!options && dropdown?.right && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-dark text-sm font-medium shrink-0 flex items-center gap-1 hover:text-neutral-dark-gray transition-colors focus:outline-none"
                  >
                    {dropdown.right.value}
                    <Icon type="arrow_drop_down" className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {dropdown.right.options.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => dropdown.right?.onSelect(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {(hint || error) && (
            <div className="flex flex-col gap-1 pt-0.5">
              {hint && (
                <span className="text-green-200 font-normal text-xs">
                  {hint}
                </span>
              )}
              {error && <span className="text-red-400 text-xs">{error}</span>}
            </div>
          )}
        </label>
      </Layout>
    );
  }
);

export { Input };
