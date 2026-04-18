import { Icon } from "@graminate/ui";
import React, { useState, useRef, useEffect } from "react";
import type { DropdownFilter } from "@/types/card-props";
import Checkbox from "@/components/ui/Checkbox";

const DropdownFilter = ({
  items,
  direction = "down",
  placeholder = "Select",
  selectedItems,
  onChange,
}: DropdownFilter) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const isItemSelected = (item: string): boolean =>
    selectedItems.includes(item);

  const toggleItem = (item: string) => {
    if (isItemSelected(item)) {
      onChange(selectedItems.filter((selectedItem) => selectedItem !== item));
    } else {
      onChange([...selectedItems, item]);
    }
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

  return (
    <div className="relative inline-block text-left w-auto" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        className="w-full hover:bg-gray-400 dark:hover:bg-gray-700 dark:text-gray-400 
        dark:focus:bg-gray-700 focus:bg-gray-400 focus:text-dark text-sm 
        px-3 py-2 rounded-md text-left flex items-center justify-between"
        onClick={toggleDropdown}
      >
        <span>
          {selectedItems.length > 0 ? (
            <>
              {placeholder}
              <span className="bg-green-200 text-white mr-2 px-2 py-0.5 text-xs rounded-full">
                {selectedItems.length}
              </span>
            </>
          ) : (
            placeholder
          )}
        </span>
        {/* Dropdown Icon */}
        <Icon type={"expand_more"} className="size-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-10 w-auto mx-4 bg-white dark:bg-gray-700 rounded-md shadow-lg mt-2 ${
            direction === "up" ? "bottom-full mb-2" : ""
          }`}
        >
          {items.map((item) => (
              <Checkbox
                key={item}
                id={`filter-${item}`}
                checked={isItemSelected(item)}
                onCheckedChange={() => toggleItem(item)}
                label={item}
                className="px-4 py-2 hover:bg-gray-400 dark:hover:bg-blue-100"
              />
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownFilter;
