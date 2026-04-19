import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../utils";
import { Icon, type IconType } from "../icon/icon";

const segmentedControlItemVariants = cva(
  "flex items-center gap-1 py-2 px-3 h-full cursor-pointer transition-[color] duration-200 ease-in-out font-medium",
  {
    variants: {
      selected: {
        true: "border dark:border-gray-600 rounded-sm shadow-xs",
        false:
          "text-neutral-gray opacity-70 hover:opacity-100  hover:text-neutral-black",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

type SegmentedControlItem = React.ComponentProps<
  typeof RadioGroupPrimitive.Item
> & {
  label: string;
  icon?: IconType;
  onClick?: (e: React.SyntheticEvent<HTMLButtonElement>) => void;
};

function SegmentedControlItem({
  item,
  isSelected,
  onClick,
}: {
  item: SegmentedControlItem;
  isSelected: boolean;
  onClick: (e: React.SyntheticEvent<HTMLButtonElement>) => void;
}) {
  return (
    <RadioGroupPrimitive.Item
      {...item}
      data-slot="segmented-control-item"
      className={cn(
        item.className,
        segmentedControlItemVariants({ selected: isSelected })
      )}
      onClick={(e) => {
        onClick(e);
        item.onClick?.(e);
      }}
    >
      {item.icon && <Icon type={item.icon} size="sm" />}
      <span>{item.label}</span>
    </RadioGroupPrimitive.Item>
  );
}

type SegmentedControlProps = React.ComponentProps<
  typeof RadioGroupPrimitive.Root
> & {
  options: { first: SegmentedControlItem; second: SegmentedControlItem };
  defaultValue: "first" | "second" | undefined;
};

function SegmentedControl({
  className,
  options,
  ...props
}: SegmentedControlProps) {
  const [selected, setSelected] = React.useState<"first" | "second">(
    props.defaultValue ?? "first"
  );

  return (
    <RadioGroupPrimitive.Root
      data-slot="segmented-control"
      className={cn(
        className,
        "flex items-center h-[42px] bg-neutral-white border border-gray-400 dark:border-gray-700 p-1 rounded-md"
      )}
      {...props}
    >
      <SegmentedControlItem
        item={options.first}
        isSelected={selected === "first"}
        onClick={() => setSelected("first")}
      />
      <SegmentedControlItem
        item={options.second}
        isSelected={selected === "second"}
        onClick={() => setSelected("second")}
      />
    </RadioGroupPrimitive.Root>
  );
}

export { SegmentedControl };
export type { SegmentedControlItem, SegmentedControlProps };
