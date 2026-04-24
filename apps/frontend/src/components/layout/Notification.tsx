import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@graminate/ui";
import { format, isToday, isYesterday, differenceInHours } from "date-fns";

export const Notification = ({
  id,
  notification,
  onRemove,
}: {
  id: number;
  notification: { title: string; description: string; isRead?: boolean; _raw?: any };
  onRemove?: (id: number) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const createMarkup = () => {
    return { __html: notification.description };
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const hoursDiff = differenceInHours(now, date);

    if (hoursDiff < 24) {
      return format(date, "h:mm a");
    }

    if (hoursDiff < 48) {
      return "Yesterday";
    }

    return format(date, "MMM d, yyyy");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 shadow-md rounded-md mb-2 bg-gray-50 dark:bg-gray-600 cursor-pointer relative group transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-1">
        <p className="font-semibold text-gray-800 dark:text-light flex-1 pr-12">
          {notification.title}
        </p>
        <div className="flex items-center gap-1 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity select-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Remove"
            className="text-dark dark:text-light transition-colors p-1 rounded-md hover:bg-gray-500 dark:hover:bg-gray-500 cursor-pointer"
          >
            <Icon type="close" size={18} className="select-none" />
          </button>
        </div>
      </div>
      <div
        className="text-sm text-dark dark:text-gray-300 mb-2"
        dangerouslySetInnerHTML={createMarkup()}
      />
      {notification._raw?.created_at && (
        <p className="text-[10px] text-dark dark:text-light text-right mt-1 font-medium">
          {formatTimestamp(notification._raw.created_at)}
        </p>
      )}
    </div>
  );
};
