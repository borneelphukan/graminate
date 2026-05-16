import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Id } from "@/types/types";

type SortableItemProps = {
  id: Id;
  children: React.ReactNode;
  isColumn?: boolean;
};

const SortableItem = ({
  id,
  children,
  isColumn = false,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: isColumn ? "Column" : "Task",
      item: { id },
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`${isDragging ? "opacity-50" : "opacity-100"} touch-manipulation`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

export default SortableItem;
