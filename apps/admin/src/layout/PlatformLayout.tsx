import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar/Navbar";
import { Sidebar } from "@graminate/ui";

type Props = {
  children: React.ReactNode;
};

const PlatformLayout = ({ children }: Props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { admin_id } = router.query;

  const navItems = [
    {
      label: "Dashboard",
      icon: "home",
      path: `/platform/${admin_id}`,
    },
    {
      label: "Users",
      icon: "group",
      path: `/platform/${admin_id}/users`,
    },
  ];

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [router.pathname]);

  if (!admin_id) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-light dark:bg-dark text-dark dark:text-light">
      <Navbar 
        userId={admin_id as string} 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 max-h-screen relative">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar 
          items={navItems}
          className="top-16"
          activePath={router.asPath.split("?")[0]}
          isOpen={isSidebarOpen}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onNavigate={(path) => router.push(path)}
        />

        <main className={`flex-1 p-6 overflow-y-auto transition-[margin] duration-300 ${isSidebarOpen ? "overflow-hidden" : ""} ${isCollapsed ? "lg:ml-[60px]" : "lg:ml-[230px]"}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PlatformLayout;
