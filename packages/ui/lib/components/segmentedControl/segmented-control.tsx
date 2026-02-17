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
        true: "border rounded-[var(--radius-sm)] border-[rgba(65,65,65,0.15)] bg-white shadow-xs",
        false:
          "text-[var(--color-neutral-gray)] opacity-70 hover:opacity-100  hover:text-[var(--color-neutral-black)]",
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
        "flex items-center h-[38px] bg-[#FBFBFB] border border-solid border-[rgba(65,65,65,0.10)] p-[1px] rounded-[var(--radius-md)]"
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
