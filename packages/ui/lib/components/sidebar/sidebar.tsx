import React from "react";
import { Icon } from "../icon/icon";

export type SidebarItem = {
  label: string;
  icon: string | React.ElementType;
  path?: string;
  section?: string; // Identifier for the section (used for expanded state)
  basePath?: string; // Used to determine active state for sub-items
  subItems?: { label: string; path: string }[];
};

export type SidebarProps = {
  items: SidebarItem[];
  activePath: string;
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: (path: string) => void;
  onSectionToggle?: (section: string) => void;
  expandedSection?: string | null;
  className?: string;
  collapseTitle?: string;
  expandTitle?: string;
};

export const Sidebar = ({
  items,
  activePath,
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onNavigate,
  onSectionToggle,
  expandedSection,
  className,
  collapseTitle = "Collapse Sidebar",
  expandTitle = "Expand Sidebar",
}: SidebarProps) => {
  return (
    <div
      className={`sidebar-container fixed inset-y-0 left-0 bg-gray-800 text-gray-300 shadow-xl transform transition-transform duration-300 ease-in-out z-[60] flex flex-col ${
        isOpen ? "translate-x-0" : "max-lg:-translate-x-full"
      } lg:translate-x-0 lg:shadow-none ${className || ""}`}
      style={{ width: isCollapsed ? 60 : 230 }}
    >
      <nav className="flex-1 overflow-hidden py-4 space-y-1 bg-gray-800">
        {items.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isSectionOpen = !!item.section && expandedSection === item.section;
          const isActive =
            (!hasSubItems && activePath === item.path) ||
            (hasSubItems && item.basePath && activePath.startsWith(item.basePath)) ||
            isSectionOpen;

          return (
            <div key={item.label} className={`relative ${isCollapsed ? "px-1" : "px-3"}`}>
              <div
                className={`flex items-center rounded-lg cursor-pointer group transition-colors duration-200 ${
                  isCollapsed ? "p-2 justify-center" : "p-3"
                } ${
                  isActive
                    ? "bg-gray-700 text-white shadow-md"
                    : "text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                }`}
                role="button"
                tabIndex={0}
                title={isCollapsed ? item.label : ""}
                onClick={() => {
                  if (item.path) {
                    onNavigate(item.path);
                  }
                  if (hasSubItems && onSectionToggle && item.section) {
                    onSectionToggle(item.section);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (item.path) onNavigate(item.path);
                    if (hasSubItems && onSectionToggle && item.section) {
                      onSectionToggle(item.section);
                    }
                  }
                }}
              >
                {typeof item.icon === "string" ? (
                  <Icon
                    type={item.icon}
                    className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`}
                  />
                ) : (
                  <div
                    className={`h-5 w-5 flex-shrink-0 flex items-center justify-center text-current ${
                      isCollapsed ? "" : "mr-3"
                    }`}
                  >
                    {React.createElement(item.icon)}
                  </div>
                )}

                {!isCollapsed && (
                  <>
                    <span className="flex-grow font-medium text-sm truncate">
                      {item.label}
                    </span>
                    {hasSubItems && (
                      <Icon
                        type="chevron_right"
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isSectionOpen ? "rotate-90" : ""
                        } ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"}`}
                      />
                    )}
                  </>
                )}
              </div>

              {!isCollapsed && isSectionOpen && hasSubItems && (
                <div className="mt-1 ml-5 pl-3 border-l border-gray-600 space-y-1">
                  {item.subItems?.map((sub) => {
                    const isSubActive = activePath === sub.path;
                    return (
                      <div
                        key={sub.label}
                        className={`text-sm py-2 px-4 rounded-md cursor-pointer transition-colors duration-150 ${
                          isSubActive
                            ? "text-indigo-300 font-semibold"
                            : "text-gray-400 hover:text-white hover:bg-gray-700"
                        }`}
                        role="button"
                        tabIndex={0}
                        onClick={() => onNavigate(sub.path)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onNavigate(sub.path);
                          }
                        }}
                      >
                        {sub.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto bg-gray-800 p-3 border-t border-gray-700">
        <button
          className={`w-full flex items-center p-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition-colors duration-200 ${
            isCollapsed ? "justify-center" : "justify-end"
          }`}
          onClick={onToggleCollapse}
          title={isCollapsed ? expandTitle : collapseTitle}
        >
          <Icon
            type={isCollapsed ? "chevron_right" : "chevron_left"}
            className="h-5 w-5"
          />
        </button>
      </div>
    </div>
  );
};
