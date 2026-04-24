import { Icon } from "@graminate/ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Notification } from "./Notification";
import type { NotificationBar } from "@/types/card-props";

const NotificationBar = ({
  notifications,
  isOpen,
  closeNotificationBar,
  onClearAll,
  onRemove,
  userId,
}: NotificationBar) => {
  const [items, setItems] = useState(notifications.map((n) => n.id));
  const router = useRouter();

  const clearAllNotifications = () => {
    onClearAll?.();
  };

  useEffect(() => {
    setItems(notifications.map((n) => n.id));
  }, [notifications]);

  const handleRemove = (id: number) => {
    setItems((prev) => prev.filter((itemId) => itemId !== id));
    onRemove?.(id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id as number);
        const newIndex = prev.indexOf(over?.id as number);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const navigateToSettings = () => {
    closeNotificationBar();
    router.push(`/${userId}/settings/notifications`);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300"
          onClick={closeNotificationBar}
        />
      )}

      <div
        className={`fixed top-0 right-0 w-full max-w-md bg-white dark:bg-gray-700 shadow-md transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ height: "100vh", zIndex: 50 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-400 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-light">
            Notifications
          </h2>

          <button
            aria-label="Close notification"
            className="text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600 p-1 rounded-md focus:outline-none"
            onClick={closeNotificationBar}
          >
            <Icon type={"close"} className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2 relative">
            <div className="flex space-x-2">{/* Buttons (if any) here */}</div>

            <div className="flex items-center space-x-2 mb-2">
              <button
                className="text-red-200 hover:text-red-100 px-3 py-1 text-sm rounded-md"
                onClick={clearAllNotifications}
              >
                <Icon type={"delete"} className="size-4" />
              </button>

              <button
                className="text-gray-300 hover:text-gray-200 focus:outline-none"
                aria-label="settings icon"
                onClick={navigateToSettings}
              >
                <Icon type={"settings"} className="size-4" />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="text-gray-300 text-center">
              You don’t have any notifications
            </p>
          ) : (
            <div className="overflow-y-auto custom-scrollbar pr-2" style={{ maxHeight: "calc(100vh - 180px)" }}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((id) => {
                    const notification = notifications.find((n) => n.id === id);
                    if (!notification) return null;
                    return (
                      <Notification
                        key={notification.id}
                        id={notification.id}
                        notification={notification}
                        onRemove={handleRemove}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationBar;
