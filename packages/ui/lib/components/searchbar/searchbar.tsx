import { Icon } from "../icon/icon";
import React from "react";
import { cn } from "../../utils";

type Props = {
  value: string;
  placeholder?: string;
  mode?: "table" | "type";
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

const SearchBar = ({ value, placeholder = "", mode, onChange, className }: Props) => {
  if (mode === "table" && !placeholder) {
    throw new Error(
      "The 'placeholder' parameter is mandatory when 'mode' is set to 'table'."
    );
  }

  if (mode === "type" && !placeholder) {
    placeholder = "Search";
  }

  return (
    <div className={cn("relative", className)}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-neutral-200 dark:border-gray-200 focus:border-brand-mute-green 
                   rounded-lg dark:bg-gray-700 focus:outline-none 
                   text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 shadow-sm transition-all"
        onChange={onChange}
      />
      <button
        className="absolute inset-y-0 right-4 flex items-center hover:scale-110 transition-transform"
        aria-label="Search"
      >
        <Icon
          type={"search"}
          className="size-5 text-neutral-500 dark:text-neutral-400"
        />
      </button>
    </div>
  );
};

export { SearchBar };
