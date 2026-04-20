import { Icon } from "@graminate/ui";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import ThemeSwitch from "@/components/ui/Switch/ThemeSwitch";
import { useClickOutside } from "@/hooks/forms";

interface NavbarProps {
  imageSrc?: string;
  userId: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Navbar = ({
  imageSrc = "/images/logo.png",
  userId,
  isSidebarOpen,
  toggleSidebar,
}: NavbarProps) => {
  const router = useRouter();
  const { darkMode, setDarkMode } = useUserPreferences();

  const [user, setUser] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    business: "",
    imageUrl: "",
  });
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setDropdownOpen(false), isDropdownOpen);

  useEffect(() => {
    async function fetchAdminDetails() {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) return;

        const response = await axiosInstance.get("/admin/me");
        const data = response.data?.data;

        if (data) {
          setUser({
            name: `${data.first_name} ${data.last_name}`,
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            business: "Platform Administrator",
            imageUrl: data.profile_picture || "",
          });
        }
      } catch (error: unknown) {
        console.error("Error fetching admin details:", error);
      }
    }

    if (userId) fetchAdminDetails();
  }, [userId]);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("darkMode");
    router.push("/");
  };

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  const handleToggleDarkMode = async () => {
    const newDarkModeState = !darkMode;
    setDarkMode(newDarkModeState);
    try {
      // Logic for saving dark mode preference if endpoint exists
      await axiosInstance.put(`/admin/${userId}`, {
        darkMode: newDarkModeState,
      });
    } catch (error) {
       console.warn("Could not sync dark mode preference with server.");
    }
  };

  return (
    <header className="sticky top-0 px-6 lg:px-12 bg-gray-800 py-2 w-full z-[60]">
      <div className="mx-auto w-full px-2 sm:px-4 lg:px-8">
        <div className="relative flex h-12 py-1 justify-between items-center">
          <div className="flex items-center">
            <button
              className="lg:hidden text-gray-400 hover:text-white focus:outline-none mr-2"
              onClick={toggleSidebar}
              aria-expanded={isSidebarOpen}
            >
              <Icon type={"menu"} className="size-6" />
            </button>
            <div className="flex flex-shrink-0 items-center gap-4">
              <Image
                src={imageSrc}
                alt="Graminate Logo"
                className="h-10 w-auto"
                width={100}
                height={40}
                priority
              />
              <span className="hidden sm:inline text-bold text-3xl text-light">
                Graminate
              </span>
              <span className="hidden md:inline-block p-1 rounded-md bg-green-200 text-white text-[10px] uppercase font-black tracking-widest leading-none">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex items-center gap-3">
              <button
                className="relative flex items-center focus:outline-none group"
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
              >
                <div className="h-8 w-8 rounded-full border border-gray-600 overflow-hidden bg-gray-700">
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.name}
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-black uppercase tracking-tighter bg-gray-400">
                      {user.firstName && user.lastName ? (
                        `${user.firstName[0]}${user.lastName[0]}`
                      ) : (
                        <Icon type="person" className="size-5" />
                      )}
                    </div>
                  )}
                </div>
              </button>

              <button 
                onClick={toggleDropdown}
                className="flex items-center gap-1 focus:outline-none group"
              >
                <span className="text-white text-sm font-bold hidden lg:inline transition-colors">
                  {user.name}
                </span>
                <Icon
                  type={isDropdownOpen ? "expand_less" : "expand_more"}
                  className="size-5 text-gray-400 group-hover:text-white transition-colors"
                />
              </button>

              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="origin-top-right absolute right-0 top-12 w-96 rounded-md shadow-lg py-4 bg-white dark:bg-gray-800"
                >
                  <div className="px-4 pb-3 border-b border-gray-500 dark:border-gray-300">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full border border-gray-400 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
                        {user.imageUrl ? (
                          <Image
                            src={user.imageUrl}
                            alt={user.name}
                            width={48}
                            height={48}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-lg font-bold uppercase tracking-tighter">
                            {user.firstName && user.lastName ? (
                              `${user.firstName[0]}${user.lastName[0]}`
                            ) : (
                              <Icon type="person" className="size-8" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-dark dark:text-light truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-dark dark:text-light truncate pb-2">
                          {user.email}
                        </p>
                        <div className="flex justify-end w-full mt-1">
                          <ThemeSwitch
                            checked={darkMode}
                            onChange={handleToggleDarkMode}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between px-4 py-3 text-sm text-dark dark:text-light">
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-dark dark:text-light hover:underline"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
