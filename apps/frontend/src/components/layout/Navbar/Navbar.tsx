import Link from "next/link";
import { Icon } from "@graminate/ui";
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import NotificationBar from "../NotificationSideBar";
import Image from "next/image";
import type { User } from "@/types/card-props";
import type { Navbar as NavbarType } from "@/types/card-props";
import axiosInstance from "@/lib/utils/axiosInstance";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { getTranslator, TranslationKey } from "@/translations";
import ThemeSwitch from "@/components/ui/Switch/ThemeSwitch";
import { useClickOutside } from "@/hooks/forms";

interface NavbarProps extends NavbarType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

type Notification = {
  id: number;
  titleKey: TranslationKey;
  description: string;
  isRead: boolean;
};

const Navbar = ({
  imageSrc = "/images/logo.png",
  userId,
  isSidebarOpen,
  toggleSidebar,
}: NavbarProps) => {
  const router = useRouter();
  const {
    language: currentLanguage,
    darkMode,
    setDarkMode,
    plan,
  } = useUserPreferences();
  const t = useMemo(() => getTranslator(currentLanguage), [currentLanguage]);

  const [user, setUser] = useState<User & { darkMode?: boolean }>({
    name: "",
    email: "",
    business: "",
    imageUrl: "",
    darkMode: false,
  });
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isNotificationBarOpen, setNotificationBarOpen] =
    useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setDropdownOpen(false), isDropdownOpen);

  const userNavigation = useMemo(
    () => [
      {
        nameKey: "pricing" as TranslationKey,
        href: `/${userId}/pricing`,
      },
      {
        nameKey: "trainingAndServices" as TranslationKey,
        href: "/training-services",
        external: true,
      },
    ],
    [userId]
  );

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await axiosInstance.get(`/user/${userId}/notifications`);
      const data = response.data?.data?.notifications;
      if (Array.isArray(data)) {
        setNotifications(
          data.map((n: any) => ({
            id: n.id,
            titleKey: n.title as TranslationKey,
            description: n.message,
            isRead: n.is_read,
            _raw: n,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [userId]);

  const dismissNotification = async (notificationId: number) => {
    try {
      await axiosInstance.delete(`/user/${userId}/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const clearAllNotifications = async () => {
    // For simplicity, we can delete all or mark all as read. 
    // The user wants permanent removal, so ideally we delete all.
    try {
      // Assuming we want to clear all locally and on backend
      for (const n of notifications) {
        await axiosInstance.delete(`/user/${userId}/notifications/${n.id}`);
      }
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const notificationCount = notifications.length;

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axiosInstance.get(`/user/${userId}`);
        const data = response.data?.data?.user;

        setUser({
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          business: data.business_name,
          imageUrl:
            data.profile_picture ||
            `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(
              data.first_name
            )}+${encodeURIComponent(data.last_name)}&size=250`,
          darkMode: data.darkMode,
        });
        if (typeof data.darkMode === "boolean" && data.darkMode !== darkMode) {
          setDarkMode(data.darkMode);
        }
      } catch (error: unknown) {
        console.error(
          "Error fetching user details:",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    if (userId) fetchUserDetails();
  }, [userId, setDarkMode, darkMode]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("chatMessages");
      localStorage.removeItem("token");
      localStorage.removeItem("language");
      localStorage.removeItem("timeFormat");
      localStorage.removeItem("temperatureScale");
      localStorage.removeItem("darkMode");
      router.push("/");
    } catch (error: unknown) {
      console.error(
        "Error during logout:",
        error instanceof Error ? error.message : "Logout failed"
      );
    }
  };

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);
  const toggleNotificationBar = () =>
    setNotificationBarOpen(!isNotificationBarOpen);

  const toUserPreferences = () => {
    router.push(`/${userId}/settings/general`);
  };

  const handleToggleDarkMode = async () => {
    const newDarkModeState = !darkMode;
    setDarkMode(newDarkModeState);
    try {
      await axiosInstance.put(`/user/${userId}`, {
        darkMode: newDarkModeState,
      });
    } catch (error) {
      console.error("Error updating dark mode preference:", error);
      setDarkMode(!newDarkModeState);
    }
  };

  return (
    <>
      <header className="sticky top-0 px-6 lg:px-12 bg-gray-800 py-2 w-full z-30 border-b border-gray-700">
        <div className="mx-auto w-full px-2 sm:px-4 lg:divide-y lg:divide-gray-700 lg:px-8">
          <div className="relative flex h-12 py-1 justify-between">
            <div className="relative z-10 flex px-2 lg:px-0">
              <div className="flex flex-shrink-0 items-center">
                <div className="flex flex-row items-center gap-4">
                  <Image
                    src={imageSrc}
                    alt="Graminate Logo"
                    className="h-10 w-auto"
                    width={100}
                    height={40}
                    priority
                  />
                  <span className="hidden sm:inline text-bold text-3xl text-light">
                    {t("graminate")}
                  </span>
                </div>

              </div>
            </div>
            <div className="relative z-10 ml-4 flex items-center">
              <div className="flex items-center space-x-3 pr-4 border-r border-gray-700">
                <button
                  aria-label={t("settings")}
                  className="text-gray-400 hover:bg-blue-100 p-2 rounded-md focus:outline-none"
                  onClick={toUserPreferences}
                >
                  <Icon type="settings" />
                </button>
                <button
                  className="relative text-gray-400 hover:bg-blue-100 p-2 rounded-md focus:outline-none"
                  onClick={toggleNotificationBar}
                  aria-label={t("notifications")}
                >
                  <Icon type={"notifications"} className="size-6" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-0 h-4 w-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>
              <div className="relative ml-4 gap-2 flex-shrink-0 flex items-center">
                <button
                  className="relative rounded-full bg-gray-800 text-sm text-white hidden lg:flex"
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                >
                  {user.imageUrl && (
                    <Image
                      className="h-7 w-7 rounded-full"
                      src={user.imageUrl}
                      alt={user.name || "User"}
                      width={28}
                      height={28}
                    />
                  )}
                </button>
                <span className="ml-2 text-white text-sm font-medium hidden lg:inline">
                  {user.name}
                </span>
                <button
                  className="ml-1 flex items-center text-gray-400 hover:text-white focus:outline-none"
                  onClick={toggleDropdown}
                >
                  <Icon
                    type={isDropdownOpen ? "expand_less" : "expand_more"}
                    className="size-5 transition-transform duration-200 ease-in-out"
                  />
                </button>
                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="origin-top-right absolute right-0 top-12 w-96 rounded-md shadow-lg py-4 bg-white dark:bg-gray-800"
                  >
                    <div className="px-4 pb-3 border-b border-gray-500 dark:border-gray-700">
                      <div className="flex items-center">
                        {user.imageUrl && (
                          <Image
                            className="h-12 w-12 rounded-full"
                            src={user.imageUrl}
                            alt={user.name || "User"}
                            width={48}
                            height={48}
                          />
                        )}
                        <div className="ml-3 flex-1 flex-col gap-1">
                          <p className="text-lg font-semibold text-dark dark:text-light">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-300">{user.email}</p>
                          {user.business && (
                            <p className="text-sm">
                              {user.business}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <a
                              href={`/${userId}/settings/general`}
                              className="text-sm font-medium text-green-200 hover:underline"
                            >
                              {t("profilePreferences")}
                            </a>
                            <ThemeSwitch
                              checked={darkMode}
                              onChange={handleToggleDarkMode}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex flex-col gap-2">
                      {userNavigation.map((item) => (
                        <div key={item.nameKey} className="flex items-center justify-between">
                          <a
                            href={item.href}
                            className="text-sm font-medium text-gray-200 dark:text-gray-500 hover:underline"
                            target={item.external ? "_blank" : "_self"}
                          >
                            {t(item.nameKey)}
                          </a>
                          {item.nameKey === "pricing" && plan && (
                            <span className="px-2 py-0.5 rounded-md bg-green-200 text-[10px] font-bold text-light uppercase tracking-wider">
                              {plan}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-dark dark:text-light border-t border-gray-500 dark:border-gray-700">
                      <button
                        className="text-sm font-medium text-dark dark:text-light hover:underline"
                        onClick={handleLogout}
                      >
                        {t("signOut")}
                      </button>
                      <Link href="/privacy-policy" target="_blank" className="hover:underline">
                        {t("privacyPolicy")}
                      </Link>

                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <NotificationBar
        userId={userId}
        notifications={notifications.map((n) => ({
          ...n,
          title: t(n.titleKey),
        }))}
        isOpen={isNotificationBarOpen}
        closeNotificationBar={toggleNotificationBar}
        onClearAll={clearAllNotifications}
        onRemove={dismissNotification}
      />
    </>
  );
};

export default Navbar;
