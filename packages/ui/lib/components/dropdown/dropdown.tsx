import { useState, useRef, useEffect } from "react";
import { Icon } from "../icon/icon";

type DropdownProps = {
  items: string[] | Record<string, string[]>;
  selectedItem: string;
  onSelect: (item: string) => void;
  direction?: "up" | "down";
  label?: React.ReactNode | null;
  placeholder?: string;
  disabledItems?: string[];
  isDisabled?: boolean;
  variant?: "small" | "large";
  width?: "full" | "half" | "auto";
  isDatePicker?: boolean;
  className?: string;
  errorMessage?: string;
};

const Dropdown = ({
  items,
  selectedItem,
  onSelect,
  direction = "down",
  label = null,
  placeholder = "Select an option",
  disabledItems = [],
  isDisabled = false,
  variant = "large",
  width = "auto",
  isDatePicker = false,
  className = "",
  errorMessage,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dropdownId = `dropdown-${Math.random().toString(36).substring(2, 15)}`;

  useEffect(() => {
    if (isDisabled) {
      setIsOpen(false);
    }
  }, [isDisabled]);

  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (item: string) => {
    if (disabledItems.includes(item)) return;
    onSelect(item);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  if (isDatePicker) {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <input
          type="date"
          value={selectedItem === "Set deadline" ? "" : selectedItem}
          onChange={(e) => onSelect(e.target.value)}
          disabled={isDisabled}
          className="w-full p-2 border border-gray-400 dark:border-gray-200 rounded-md dark:bg-gray-700 text-dark dark:text-light disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-1 focus:ring-green-200"
        />
      </div>
    );
  }

  const renderItems = () => {
    if (Array.isArray(items)) {
      return items.map((item) => (
        <li
          key={item}
          role="option"
          tabIndex={0}
          className={`px-4 py-2 text-sm transition-colors duration-150 ${
            disabledItems.includes(item)
              ? "font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 cursor-default"
              : "text-dark dark:bg-gray-700 dark:text-light hover:bg-gray-500 dark:hover:bg-gray-600 cursor-pointer"
          }`}
          onClick={() => handleSelect(item)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleSelect(item);
            }
          }}
          aria-selectedItem={selectedItem === item && !disabledItems.includes(item)}
          aria-disabled={disabledItems.includes(item)}
        >
          {item}
        </li>
      ));
    } else {
      return Object.entries(items).map(([groupName, groupItems]) => (
        <div key={groupName}>
          <li className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
            {groupName}
          </li>
          {groupItems.map((item) => (
            <li
              key={item}
              role="option"
              tabIndex={0}
              className="px-6 py-2 text-sm text-dark dark:text-gray-200 hover:bg-gray-500 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-150"
              onClick={() => handleSelect(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleSelect(item);
                }
              }}
              aria-selectedItem={selectedItem === item}
            >
              {item}
            </li>
          ))}
        </div>
      ));
    }
  };

  const widthClass = width === "full" ? "w-full" : width === "half" ? "w-1/2" : "w-auto";
  const containerClasses = `${variant === "small" ? "md:w-auto" : ""} ${widthClass} ${className}`;

  return (
    <div className={`relative ${containerClasses}`} ref={dropdownRef}>
      {label && (
        <label
          htmlFor={dropdownId}
          className={`block mb-1 text-sm font-medium ${
            variant === "small" ? "text-dark dark:text-gray-300" : "text-gray-200 dark:text-gray-300"
          }`}
        >
          {label}
        </label>
      )}

      <button
        id={dropdownId}
        type="button"
        className={`w-full flex items-center justify-between transition-all duration-200 border ${
          variant === "small" ? "p-2.5 text-sm" : "px-4 py-2 text-sm"
        } rounded-md ${
          isDisabled
            ? "bg-white dark:bg-gray-200 border-gray-400 dark:border-gray-700 cursor-not-allowed"
            : errorMessage
            ? "dark:bg-gray-700 border-red-500 focus:outline-none focus:ring-1 focus:ring-red-200"
            : "dark:bg-gray-700 border-gray-400 dark:border-gray-200 hover:border-gray-500 dark:hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-green-200"
        }`}
        onClick={toggleDropdown}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate ${!selectedItem ? "text-dark dark:text-light" : "text-dark dark:text-light"}`}>
          {selectedItem || placeholder}
        </span>
        <Icon
          type={variant === "small" ? "expand_more" : "expand_more"}
          className={`size-5 ml-2 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${variant === "small" ? "text-gray-400 dark:text-gray-500" : "text-gray-300"}`}
        />
      </button>

      {isOpen && !isDisabled && (
        <ul
          className={`absolute ${
            direction === "up" ? "bottom-full mb-1" : "top-full mt-1"
          } left-0 w-full 
                     bg-white dark:bg-gray-700 
                     border border-gray-400 dark:border-gray-200 
                     rounded-md shadow-xl 
                     max-h-60 overflow-y-auto z-50`}
          role="listbox"
          aria-labelledby={dropdownId}
        >
          {renderItems()}
        </ul>
      )}
      {errorMessage && (
        <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

export { Dropdown };
export type { DropdownProps };
