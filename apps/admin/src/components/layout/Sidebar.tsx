import React, { useState } from "react";
import { useRouter } from "next/router";
import { Icon } from "@graminate/ui";

type SidebarProps = {
  adminId: string;
  isOpen: boolean;
};

const Sidebar = ({ adminId, isOpen }: SidebarProps) => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      icon: "home",
      path: `/platform/${adminId}`,
    },
    {
      label: "Users",
      icon: "group",
      path: `/platform/${adminId}/users`,
    },
    {
      label: "Documents",
      icon: "description",
      path: `/platform/${adminId}/documents`,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    router.push("/");
  };

  const toggleCollapse = () => {
    setIsCollapsed((c) => !c);
  };

  return (
    <div
      className={`sidebar-container fixed inset-y-0 left-0 bg-gradient-to-b from-gray-800 to-gray-900 text-gray-300 shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:relative lg:shadow-none`}
      style={{ width: isCollapsed ? 60 : 230 }}
    >
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = router.pathname === item.path;
          return (
            <div key={item.label} className="relative px-3">
              <div
                className={`flex items-center p-3 rounded-lg cursor-pointer group transition-colors duration-200 ${
                  isActive
                    ? "bg-gray-700 text-white shadow-md"
                    : "text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                } ${isCollapsed ? "justify-center" : ""}`}
                role="button"
                tabIndex={0}
                title={isCollapsed ? item.label : ""}
                onClick={() => router.push(item.path)}
              >
                <Icon
                  type={item.icon as any}
                  className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`}
                />
                {!isCollapsed && (
                  <span className="flex-grow font-medium text-sm truncate">
                    {item.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto p-3 border-t border-gray-700 space-y-1">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full p-3 rounded-lg cursor-pointer text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200 ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Sign Out" : ""}
        >
          <Icon type={"logout" as any} className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
          {!isCollapsed && <span className="font-medium text-sm">Sign Out</span>}
        </button>

        <button
          className={`w-full flex items-center p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition-colors duration-200 ${
            isCollapsed ? "justify-center" : "justify-end"
          }`}
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
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

export default Sidebar;
