import React, { useState } from "react";
import { Icon } from "@graminate/ui";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (widgets: string[]) => void;
  initialSelectedWidgets: string[];
};

const AVAILABLE_ADMIN_WIDGETS = [
  { id: "Total Users", label: "Total Platform Users", icon: "group", description: "Summary of registered accounts" },
  { id: "Plan Distribution", label: "Plan Distribution", icon: "pie_chart", description: "Ratio of Free vs Paid users" },
];

const WidgetModal = ({ isOpen, onClose, onSave, initialSelectedWidgets }: Props) => {
  const [selected, setSelected] = useState<string[]>(initialSelectedWidgets);

  if (!isOpen) return null;

  const toggleWidget = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-dark dark:text-light">Manage Dashboard</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <Icon type="close" className="size-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select the metrics you want to monitor on your home dashboard.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {AVAILABLE_ADMIN_WIDGETS.map((widget) => (
              <div
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                  selected.includes(widget.id)
                    ? "border-green-600 bg-green-50 dark:bg-green-900/10"
                    : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  selected.includes(widget.id) ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                }`}>
                  <Icon type={widget.icon as any} className="size-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-dark dark:text-light">{widget.label}</h4>
                  <p className="text-xs text-gray-500">{widget.description}</p>
                </div>
                {selected.includes(widget.id) && (
                  <Icon type="check_circle" className="size-5 text-green-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selected)}
            className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold shadow-lg shadow-green-600/20 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetModal;
