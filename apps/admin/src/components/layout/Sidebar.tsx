import React from "react";
import { useRouter } from "next/router";
import { Icon } from "@graminate/ui";

type SidebarProps = {
  adminId: string;
};

const Sidebar = ({ adminId }: SidebarProps) => {
  const router = useRouter();

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

  return (
    <div className="flex flex-col w-64 bg-gray-800 text-gray-300 h-screen sticky top-0 p-4">
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.label} className="mb-2">
              <a
                onClick={() => router.push(item.path)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                  router.pathname === item.path
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon type={item.icon as any} className="w-5 h-5 mr-4" />
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-lg cursor-pointer text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200"
        >
          <Icon type={"logout" as any} className="w-5 h-5 mr-4" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
