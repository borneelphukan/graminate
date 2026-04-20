import { Icon, Checkbox, Button } from "@graminate/ui";
import React, { useState, useEffect, useMemo, useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (widgets: string[]) => void;
  initialSelectedWidgets: string[];
};

const AVAILABLE_ADMIN_WIDGETS = [
  { id: "Total Users", name: "Total Platform Users" },
  { id: "User Growth Trend", name: "Growth & Conversion Insights" },
  { id: "Plan Distribution", name: "Plan Distribution" },
];

const WidgetModal = ({ isOpen, onClose, onSave, initialSelectedWidgets }: Props) => {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(
    initialSelectedWidgets
  );
  const modalRef = useRef<HTMLDivElement>(null);

  const categorizedWidgets = useMemo(() => {
    const groups: Record<string, typeof AVAILABLE_ADMIN_WIDGETS> = {
      General: AVAILABLE_ADMIN_WIDGETS,
    };
    return groups;
  }, []);

  const categoryIcons: Record<string, string | React.ElementType> = {
    General: "drag_indicator",
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedWidgets(initialSelectedWidgets);
    }
  }, [isOpen, initialSelectedWidgets]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCheckboxChange = (widgetId: string, isChecked: boolean) => {
    setSelectedWidgets((prev) => {
      if (isChecked) {
        return [...prev, widgetId];
      } else {
        return prev.filter((id) => id !== widgetId);
      }
    });
  };

  const handleSaveClick = () => {
    onSave(selectedWidgets);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 w-full max-w-4xl p-6 rounded-lg shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-dark dark:text-light">
            Manage Dashboard Widgets
          </p>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-400 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon type={"close"} className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 py-4 my-2">
          {Object.entries(categorizedWidgets).map(
            ([category, widgetsInCategory]) => {
              const icon = categoryIcons[category];
              return (
                <div
                  key={category}
                  className="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-green-200 h-5 w-5 flex items-center justify-center">
                      {typeof icon === "string" ? (
                        <Icon
                          type={icon}
                          className="h-full w-full"
                        />
                      ) : (
                        React.createElement(icon as React.ElementType)
                      )}
                    </div>
                    <h4 className="font-semibold text-dark dark:text-light">
                      {category}
                    </h4>
                  </div>
                  <div className="mt-4 h-28 grid grid-rows-3 grid-flow-col auto-cols-max gap-x-8 gap-y-3">
                    {widgetsInCategory.map((widget) => (
                      <div key={widget.id} className="flex items-center">
                        <Checkbox
                          id={`widget-${widget.id}`}
                          label={widget.name}
                          checked={selectedWidgets.includes(widget.id)}
                          onCheckedChange={(checked: boolean) =>
                            handleCheckboxChange(widget.id, !!checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-400 dark:border-gray-700">
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label="Save Changes"
            variant="primary"
            onClick={handleSaveClick}
          />
        </div>
      </div>
    </div>
  );
};

export default WidgetModal;
