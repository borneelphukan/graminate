import {
  forwardRef,
  useState,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { cn } from "../../utils";
import { Icon } from "../icon/icon";
import { Layout } from "../layouts/layout";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";

type TagInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "value" | "onChange"
> & {
  id: string;
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  validate?: (tag: string) => boolean;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  options?: string[];
};

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      className,
      id,
      label,
      value = [],
      onChange,
      validate,
      hideLabel,
      hint,
      error,
      disabled,
      placeholder,
      onBlur,
      options,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState("");
    const [inputError, setInputError] = useState<string | undefined>(undefined);
    const [open, setOpen] = useState(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      setInputError(undefined);
      if (options) setOpen(true);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!options) {
          addTag();
        }
      } else if (
        e.key === "Backspace" &&
        inputValue === "" &&
        value.length > 0
      ) {
        e.preventDefault();
        const newTags = [...value];
        newTags.pop();
        onChange(newTags);
      }
    };

    const addTag = () => {
      const tag = inputValue.trim();
      if (!tag) return;

      if (value.includes(tag)) {
        setInputError("Tag already exists");
        return;
      }

      if (validate && !validate(tag)) {
        setInputError("Invalid tag format");
        return;
      }

      onChange([...value, tag]);
      setInputValue("");
      setInputError(undefined);
    };

    const removeTag = (indexToRemove: number) => {
      onChange(value.filter((_, index) => index !== indexToRemove));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (inputValue.trim() && !options) {
        addTag();
      }
      if (onBlur) {
        onBlur(e);
      }
    };

    const handleOptionSelect = (option: string) => {
      if (!value.includes(option)) {
        onChange([...value, option]);
        setInputValue("");
        setOpen(false);
      }
    };

    const availableOptions = options
      ? options.filter(
          (opt) =>
            !value.includes(opt) &&
            opt.toLowerCase().includes(inputValue.toLowerCase())
        )
      : [];

    const inputContainer = (
      <div
        className={cn(
          "flex flex-wrap gap-2 items-center py-2 px-3 rounded-lg border-1 border-neutral-light-gray/40 shadow-xs shadow-black/20 transition-colors min-h-[42px]",
          (error || inputError) && "border-red-200",
          "group-focus-within/input:!ring-[2px] group-focus-within/input:!ring-offset-2",
          error || inputError
            ? "group-focus-within/input:!ring-red-200"
            : "group-focus-within/input:!ring-brand-mute-green",
          options && "cursor-pointer",
          className
        )}
        onClick={(e) => {
          if (options) {
            if ((e.target as HTMLElement).tagName !== "INPUT") {
              e.preventDefault();
              e.currentTarget.querySelector("input")?.focus();
            }
          }
        }}
      >
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-gray/10 border border-neutral-black/20 text-sm font-medium text-neutral-black"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="text-neutral-gray hover:text-neutral-black transition-colors outline-none flex items-center justify-center"
            >
              <Icon type="close" size="xs" />
            </button>
          </span>
        ))}

        <input
          className={cn(
            "border-none flex-1 min-w-[120px] placeholder-neutral-gray focus:outline-none focus:placeholder-neutral-dark-gray text-sm leading-none bg-transparent",
            "py-0.5",
            options && "cursor-text"
          )}
          id={id}
          ref={ref}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : undefined}
          disabled={disabled}
          readOnly={false}
          {...props}
        />
        {options && (
          <Icon
            type="arrow_drop_down"
            size="md"
            className="text-neutral-gray ml-auto"
          />
        )}
      </div>
    );

    return (
      <Layout className={disabled ? "cursor-not-allowed opacity-50" : ""}>
        <label
          className={cn(
            "flex flex-col gap-1.5 group/input",
            disabled && "pointer-events-none"
          )}
          htmlFor={id}
        >
          <span
            className={
              hideLabel
                ? "sr-only"
                : "text-neutral-gray font-medium text-sm group-focus-within/input:text-neutral-dark-gray"
            }
          >
            {label}
          </span>

          {options ? (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>{inputContainer}</PopoverTrigger>
              <PopoverContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="p-1 w-[var(--radix-popover-trigger-width)] min-w-[200px]"
                align="start"
              >
                <div className="flex flex-col max-h-60 overflow-y-auto">
                  {availableOptions.length > 0 ? (
                    availableOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className="text-left px-2 py-1.5 text-sm hover:bg-neutral-gray/10 rounded-sm transition-colors text-neutral-black"
                        onClick={() => handleOptionSelect(opt)}
                      >
                        {opt}
                      </button>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-neutral-gray italic">
                      No more options available
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            inputContainer
          )}

          {(hint || error || inputError) && (
            <div className="flex flex-col gap-1 pt-0.5">
              {hint && !error && !inputError && (
                <span className="text-neutral-gray font-normal text-xs">
                  {hint}
                </span>
              )}
              {(error || inputError) && (
                <span className="text-red-400 text-xs">
                  {inputError || error}
                </span>
              )}
            </div>
          )}
        </label>
      </Layout>
    );
  }
);

export { TagInput };
