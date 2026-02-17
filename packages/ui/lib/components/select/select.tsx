import * as RadixSelect from "@radix-ui/react-select";
import React, {
  forwardRef,
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../../utils.ts";
import { Icon, type IconType } from "../icon/icon.tsx";
import { Layout } from "../layouts/layout.tsx";

type InnerValue = { label: string; value: string; icon?: IconType };
type SwitchValue = {
  label: string;
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: IconType;
};
type ActionButton = {
  label: string;
  icon?: IconType;
  onClick: () => void;
};
type GroupedValues = {
  groupName: string | null;
  values: InnerValue[];
};
type Values = InnerValue[] | GroupedValues[];

type Props = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "value" | "onValueChange"
> & {
  id: string;
  label: string;
  iconLeft?: IconType;
  hideLabel?: boolean;
  triggerPlaceholder?: string;
  values: Values;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  switchItems?: SwitchValue[];
  actionButton?: ActionButton;
};

type SingleSelectProps = Props & {
  multiple?: false;
  value?: string;
  onValueChange?: (value: string) => void;
};

type MultiSelectProps = Props & {
  multiple: true;
  value?: string[];
  onValueChange?: (value: string[]) => void;
  multiDisplayFormatter?: (
    selectedValues: string[],
    allValues: InnerValue[]
  ) => ReactNode;
};

type SelectProps = SingleSelectProps | MultiSelectProps;

type SelectContextType = {
  multiple: boolean;
  selectedValues: string[];
};
const SelectContext = createContext<SelectContextType>({
  multiple: false,
  selectedValues: [],
});

const MAX_DISPLAY_ITEMS = 2;

const defaultMultiDisplayFormatter = (
  selectedValues: string[],
  allValues: InnerValue[]
): string => {
  const selectedLabels = selectedValues.map(
    (val) => allValues.find((item) => item.value === val)?.label ?? val
  );

  if (selectedLabels.length <= MAX_DISPLAY_ITEMS) {
    return selectedLabels.join(", ");
  }

  const visibleLabels = selectedLabels.slice(0, MAX_DISPLAY_ITEMS);
  const hiddenCount = selectedLabels.length - MAX_DISPLAY_ITEMS;

  return `${visibleLabels.join(", ")}, +${hiddenCount} more`;
};

const Select = forwardRef<HTMLButtonElement, SelectProps>((props, ref) => {
  const {
    className,
    id,
    label,
    iconLeft,
    hideLabel,
    disabled,
    triggerPlaceholder = "Select an option",
    values,
    hint,
    error,
    required,
    switchItems,
    actionButton,
    ...restProps
  } = props;

  const isInvalid = !!error;

  const flatValues = useMemo(
    () => values.flatMap((v) => ("groupName" in v ? v.values : v)),
    [values]
  );

  const multiDisplayValue = useMemo(() => {
    if (!props.multiple || !props.value || props.value.length === 0) {
      return null;
    }
    const formatter =
      "multiDisplayFormatter" in props &&
      typeof props.multiDisplayFormatter === "function"
        ? props.multiDisplayFormatter
        : defaultMultiDisplayFormatter;
    return formatter(props.value, flatValues);
  }, [
    props.multiple,
    props.value,
    "multiDisplayFormatter" in props ? props.multiDisplayFormatter : undefined,
    flatValues,
  ]);

  const hasValue = props.multiple
    ? props.value && props.value.length > 0
    : props.value !== undefined;

  const selectedValues =
    props.multiple && Array.isArray(props.value) ? props.value : [];

  return (
    <Layout className="disabled:cursor-not-allowed disabled:opacity-50">
      <div className="flex flex-col gap-1.5 group/select disabled:pointer-events-none">
        <label
          htmlFor={id}
          className={cn(
            hideLabel
              ? "sr-only"
              : "transition-colors duration-150 text-left text-neutral-gray font-medium text-sm group-focus-within/select:text-neutral-dark-gray group-data-[state=open]/select:text-neutral-dark-gray mb-1.5 block" +
                  (disabled ? " cursor-not-allowed" : "")
          )}
        >
          {label}
          {required && <span className="text-red-200 ml-1">*</span>}
        </label>

        <SelectContext.Provider
          value={{ multiple: !!props.multiple, selectedValues }}
        >
          <RadixSelect.Root
            data-slot="select"
            value={typeof props.value === "string" ? props.value : undefined}
            onValueChange={
              typeof props.onValueChange === "function"
                ? (val) => {
                    if (props.multiple && Array.isArray(props.value)) {
                      const alreadySelected = props.value.includes(val);
                      const newValue = alreadySelected
                        ? props.value.filter((v) => v !== val)
                        : [...props.value, val];
                      (props.onValueChange as (value: string[]) => void)?.(
                        newValue
                      );
                    } else {
                      (props.onValueChange as (value: string) => void)?.(val);
                    }
                  }
                : undefined
            }
          >
            <RadixSelect.Trigger
              // Becomes button, but visually looks like input with the input on top of a field
              ref={ref}
              id={id}
              data-slot="select-trigger"
              className={cn(
                "group/select data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-none outline-none",
                disabled && "cursor-not-allowed opacity-50"
              )}
              disabled={disabled}
              aria-invalid={isInvalid}
              {...restProps}
            >
              <div
                // Actually looks like the button now
                className={cn(
                  "flex flex-row gap-2 items-center py-1.5 px-3 rounded-lg border-1 shadow-xs shadow-black/20 transition-colors border-input aria-invalid:border-destructive w-full min-w-32 justify-between bg-transparent text-base whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                  "transition-colors duration-150 group-focus-within/select:!ring-[2px] group-focus-within/select:!ring-offset-2 group-data-[state=open]/select:!ring-[2px] group-data-[state=open]/select:!ring-offset-2 text-left",
                  isInvalid
                    ? "group-focus-within/select:!ring-red-200 group-data-[state=open]/select:!ring-red-200"
                    : "group-focus-within/select:!ring-brand-mute-green group-data-[state=open]/select:!ring-brand-mute-green",
                  className
                )}
              >
                {iconLeft && (
                  <RadixSelect.Icon
                    className="m-auto text-neutral-gray group-focus-within/select:text-neutral-dark-gray group-data-[state=open]/select:text-neutral-dark-gray transition-colors duration-150"
                    asChild
                  >
                    <Icon type={iconLeft} size="md" />
                  </RadixSelect.Icon>
                )}
                <span
                  className={cn(
                    "px-0.5 w-full transition-colors duration-150 text-black",
                    !hasValue &&
                      "text-neutral-gray group-focus-within/select:text-neutral-dark-gray group-data-[state=open]/select:text-neutral-dark-gray"
                  )}
                >
                  {props.multiple && multiDisplayValue ? (
                    <span className="line-clamp-1">{multiDisplayValue}</span>
                  ) : (
                    <RadixSelect.Value placeholder={triggerPlaceholder} />
                  )}
                </span>
                <RadixSelect.Icon asChild>
                  <Icon
                    type="arrow_drop_down"
                    size="md"
                    className="text-neutral-gray group-focus-within/select:text-neutral-dark-gray group-data-[state=open]/select:text-neutral-dark-gray transition-colors duration-150"
                  />
                </RadixSelect.Icon>
              </div>
            </RadixSelect.Trigger>
            <RadixSelect.Portal>
              <RadixSelect.Content
                data-slot="select-content"
                position="popper"
                className="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border-1 border-neutral-light-gray shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
              >
                <RadixSelect.ScrollUpButton
                  data-slot="select-scroll-up-button"
                  className="flex cursor-default items-center justify-center py-1"
                >
                  <Icon type="arrow_drop_up" size="md" />
                </RadixSelect.ScrollUpButton>
                <RadixSelect.Viewport className="p-1 h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1">
                  {values.map((val, idx) =>
                    "groupName" in val ? (
                      // Groups
                      <React.Fragment key={`group-${idx}`}>
                        <RadixSelect.Group data-slot="select-group">
                          {val.groupName && (
                            <RadixSelect.Label
                              data-slot="select-label"
                              className="text-muted-foreground px-2 py-1.5 text-xs"
                            >
                              {val.groupName}
                            </RadixSelect.Label>
                          )}
                          {val.values.map(({ label, value, icon }) => (
                            <Item
                              key={value}
                              label={label}
                              value={value}
                              icon={icon}
                            />
                          ))}
                        </RadixSelect.Group>
                        {idx < values.length - 1 && (
                          <RadixSelect.Separator
                            data-slot="select-separator"
                            className="bg-border pointer-events-none -mx-1 my-1 h-px"
                          />
                        )}
                      </React.Fragment>
                    ) : (
                      // Standard
                      <Item
                        key={idx}
                        label={val.label}
                        value={val.value}
                        icon={val.icon}
                      />
                    )
                  )}

                  {switchItems && switchItems.length > 0 && (
                    <>
                      <RadixSelect.Separator
                        data-slot="select-separator"
                        className="bg-border pointer-events-none -mx-1 my-1 h-px"
                      />
                      {switchItems.map((switchItem) => (
                        <SwitchItem
                          key={switchItem.id}
                          id={switchItem.id}
                          label={switchItem.label}
                          checked={switchItem.checked}
                          onChange={switchItem.onChange}
                          icon={switchItem.icon}
                        />
                      ))}
                    </>
                  )}

                  {actionButton && (
                    <>
                      <RadixSelect.Separator
                        data-slot="select-separator"
                        className="bg-border pointer-events-none -mx-1 my-1 h-px"
                      />
                      <ActionButtonItem
                        label={actionButton.label}
                        icon={actionButton.icon}
                        onClick={actionButton.onClick}
                      />
                    </>
                  )}
                </RadixSelect.Viewport>
                <RadixSelect.ScrollDownButton
                  data-slot="select-scroll-down-button"
                  className="flex cursor-default items-center justify-center py-1"
                >
                  <Icon type="arrow_drop_down" size="md" />
                </RadixSelect.ScrollDownButton>
              </RadixSelect.Content>
            </RadixSelect.Portal>
          </RadixSelect.Root>
        </SelectContext.Provider>

        {hint && (
          <span className="text-neutral-gray font-normal text-xs">{hint}</span>
        )}
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>
    </Layout>
  );
});

function Item({ label, value, icon }: InnerValue) {
  const { multiple, selectedValues } = useContext(SelectContext);
  const isSelected = multiple && selectedValues.includes(value);

  return (
    <RadixSelect.Item
      value={value}
      data-slot="select-item"
      onSelect={multiple ? (e) => e.preventDefault() : undefined}
      className="focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2"
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        {multiple ? (
          isSelected && <Icon type="check" size="md" />
        ) : (
          <RadixSelect.ItemIndicator>
            <Icon type="check" size="md" />
          </RadixSelect.ItemIndicator>
        )}
      </span>
      {icon && (
        <Icon
          type={icon}
          size="md"
          className="text-neutral-gray shrink-0 pointer-events-none"
        />
      )}
      <RadixSelect.ItemText>{label}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}

function SwitchItem({ label, id, checked, onChange, icon }: SwitchValue) {
  const [internalChecked, setInternalChecked] = useState(checked);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newValue = !internalChecked;
    setInternalChecked(newValue);
    onChange(newValue);
  };

  return (
    <div
      role="menuitemcheckbox"
      aria-checked={internalChecked}
      data-slot="select-switch-item"
      onClick={handleClick}
      className="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm py-1.5 px-2 text-sm outline-hidden select-none hover:bg-accent"
    >
      <div className="flex items-center gap-2">
        {icon && (
          <Icon type={icon} size="md" className="text-neutral-gray shrink-0" />
        )}
        <span>{label}</span>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={internalChecked}
        onClick={handleClick}
        className={cn(
          "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent",
          "transition-colors duration-200 ease-in-out",
          internalChecked ? "bg-[#149184]" : "bg-neutral-light-gray"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0",
            "transition duration-200 ease-in-out",
            internalChecked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

function ActionButtonItem({ label, icon, onClick }: ActionButton) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      type="button"
      data-slot="select-action-button"
      onClick={handleClick}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm py-1.5 px-2 text-sm outline-hidden select-none border border-dashed border-[oklch(var(--neutral-dark-gray)_/_30%)] hover:bg-accent transition-colors mt-1"
    >
      {icon && (
        <Icon type={icon} size="md" className="text-neutral-gray shrink-0" />
      )}
      <span>{label}</span>
    </button>
  );
}

export { Select };
export type {
  InnerValue as SelectValue,
  SwitchValue as SelectSwitchValue,
  ActionButton as SelectActionButton,
};
