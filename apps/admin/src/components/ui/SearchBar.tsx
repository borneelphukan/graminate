import { Icon } from "@graminate/ui";
import React from "react";

type Props = {
  value: string;
  placeholder?: string;
  mode?: "table" | "type";
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SearchBar = ({ value, placeholder = "", mode, onChange }: Props) => {
  if (mode === "table" && !placeholder) {
    throw new Error(
      "The 'placeholder' parameter is mandatory when 'mode' is set to 'table'."
    );
  }

  if (mode === "type" && !placeholder) {
    placeholder = "Search";
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className="w-full px-4 py-1 border border-gray-300 dark:border-gray-200 focus:border-green-200 
                   rounded-md dark:bg-gray-700 focus:outline-none 
                   text-dark dark:text-light placeholder-gray-300 dark:placeholder-gray-500"
        onChange={onChange}
      />
      <button
        className="absolute inset-y-0 right-4 flex items-center"
        aria-label="Search"
      >
        <Icon
          type={"search"}
          className="size-5 text-gray-800 dark:text-white"
        />
      </button>
    </div>
  );
};

export default SearchBar;
