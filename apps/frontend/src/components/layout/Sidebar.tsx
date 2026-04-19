import { Icon } from "@graminate/ui";
import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { Sidebar as SidebarProps } from "@/types/card-props";
import Loader from "../ui/Loader";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { getTranslator, TranslationKey } from "@/translations";
import BeeIcon from "@/icons/BeeIcon";
import PoultryIcon from "@/icons/PoultryIcon";
import CattleIcon from "@/icons/CattleIcon";

type SidebarSection = {
  icon: string | React.ElementType;
  labelKey: TranslationKey;
  section: string;
  route?: string;
  basePath?: string;
  subItems: { labelKey: TranslationKey; route: string }[];
};

const Sidebar = ({ isOpen, userId, onSectionChange }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    language: currentLanguage,
    userType,
    subTypes,
    isSubTypesLoading,
    fetchUserSubTypes,
  } = useUserPreferences();
  const t = useMemo(() => getTranslator(currentLanguage), [currentLanguage]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserSubTypes(userId);
    }
  }, [userId, fetchUserSubTypes]);

  const sections: SidebarSection[] = useMemo(() => {
    const base: SidebarSection[] = [
      {
        icon: "home",
        labelKey: "dashboard",
        section: "Dashboard",
        route: `/${userId}`,
        subItems: [],
      },
      {
        icon: "contacts",
        labelKey: "crm",
        section: "CRM",
        basePath: `/${userId}/crm`,
        subItems: [
          {
            labelKey: "contacts",
            route: `/${userId}/crm?view=contacts`,
          },
          {
            labelKey: "companies",
            route: `/${userId}/crm?view=companies`,
          },
          {
            labelKey: "contracts",
            route: `/${userId}/crm?view=contracts`,
          },
          {
            labelKey: "receipts",
            route: `/${userId}/crm?view=receipts`,
          },
          { labelKey: "projects", route: `/${userId}/crm?view=tasks` },
        ],
      },
    ];

    if (userType === "Producer") {
      if (subTypes.includes("Poultry")) {
        base.push({
          icon: PoultryIcon,
          labelKey: "poultryFarm",
          section: "Poultry Farm",
          route: `/${userId}/poultry`,
          subItems: [],
        });
      }
      if (subTypes.includes("Cattle Rearing")) {
        base.push({
          icon: CattleIcon,
          labelKey: "cattleRearing",
          section: "Cattle Rearing",
          route: `/${userId}/cattle_rearing`,
          subItems: [],
        });
      }
      if (subTypes.includes("Apiculture")) {
        base.push({
          icon: BeeIcon,
          labelKey: "apiculture",
          section: "Apiculture",
          route: `/${userId}/apiculture`,
          subItems: [],
        });
      }
      base.push({
        icon: "cloud",
        labelKey: "weatherMonitor",
        section: "Weather Monitor",
        route: `/${userId}/weather`,
        subItems: [],
      });
    }

    base.push(
      {
        icon: "group",
        labelKey: "employees",
        section: "Labour",
        basePath: `/${userId}/labour`,
        subItems: [
          {
            labelKey: "database",
            route: `/${userId}/labour_database`,
          },
          {
            labelKey: "salaryManager",
            route: `/${userId}/labour_payment`,
          },
        ],
      },
      {
        icon: "attach_money",
        labelKey: "finance",
        section: "Finance",
        route: `/${userId}/finance_dashboard`,
        subItems: [
          {
            labelKey: "dashboard",
            route: `/${userId}/finance_dashboard`,
          },
          {
            labelKey: "sales",
            route: `/${userId}/finance_sales`,
          },
          {
            labelKey: "expenses",
            route: `/${userId}/finance_expenses`,
          },
        ],
      },
      {
        icon: "warehouse",
        labelKey: "storage",
        section: "storage",
        route: `/${userId}/storage`,
        subItems: [],
      },
      {
        icon: "add",
        labelKey: "addService",
        section: "Add Service",
        route: `/${userId}/add_service`,
        subItems: [],
      }
    );

    return base;
  }, [userId, userType, subTypes]);

  const navigateTo = (route: string) => {
    router.push(route);
    setExpandedSection(null);
  };

  const handleSectionToggle = (
    section: string,
    hasSubItems: boolean,
    route?: string
  ) => {
    if (route && !hasSubItems) {
      navigateTo(route);
    } else if (hasSubItems) {
      const isOpen = expandedSection === section;
      setExpandedSection(isOpen ? null : section);
      if (!isOpen && onSectionChange) onSectionChange(section);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed((c) => !c);
    setExpandedSection(null);
  };

  const closeSubMenu = () => setExpandedSection(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const side = document.querySelector(".sidebar-container");
      if (side && !side.contains(e.target as Node)) closeSubMenu();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isOpen) closeSubMenu();
  }, [isOpen]);

  return (
    <div
      className={`sidebar-container fixed inset-y-0 left-0 bg-gradient-to-b from-gray-800 to-gray-900 text-gray-300 shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:relative lg:shadow-none`}
      style={{ width: isCollapsed ? 60 : 230 }}
    >
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {isSubTypesLoading ? (
          <div className="text-center text-gray-400 text-sm px-4">
            <Loader />
            {!isCollapsed && <p className="mt-2">{t("loadingSidebar")}</p>}
          </div>
        ) : (
          sections.map(
            ({ icon, labelKey, section, route, basePath, subItems }) => {
              const hasSubItems = subItems.length > 0;
              const translatedLabel = t(labelKey);
              const isActive =
                (!hasSubItems && pathname === route) ||
                (hasSubItems && basePath && pathname.startsWith(basePath)) ||
                expandedSection === section;

              return (
                <div key={section} className={`relative ${isCollapsed ? "px-1" : "px-3"}`}>
                  <div
                    className={`flex items-center ${
                      isCollapsed ? "p-2" : "p-3"
                    } rounded-lg cursor-pointer group transition-colors duration-200 ${
                      isActive
                        ? "bg-gray-700 text-white shadow-md"
                        : "text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                    } ${isCollapsed ? "justify-center" : ""}`}
                    role="button"
                    tabIndex={0}
                    title={isCollapsed ? translatedLabel : ""}
                    onClick={() =>
                      handleSectionToggle(section, hasSubItems, route)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSectionToggle(section, hasSubItems, route);
                      }
                    }}
                  >
                    {typeof icon === "string" ? (
                      <Icon
                        type={icon}
                        className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`}
                      />
                    ) : (
                      <div
                        className={`h-5 w-5 flex-shrink-0 ${
                          isCollapsed ? "" : "mr-3"
                        } flex items-center justify-center text-current`}
                      >
                        {React.createElement(icon)}
                      </div>
                    )}

                    {!isCollapsed && (
                      <>
                        <span className="flex-grow font-medium text-sm truncate">
                          {translatedLabel}
                        </span>
                        {hasSubItems && (
                          <Icon
                            type={"chevron_right"}
                            className={`h-4 w-4 transition-transform duration-200 ${
                              expandedSection === section ? "rotate-90" : ""
                            } ${
                              isActive
                                ? "text-white"
                                : "text-gray-500 group-hover:text-gray-300"
                            }`}
                          />
                        )}
                      </>
                    )}
                  </div>

                  {!isCollapsed &&
                    expandedSection === section &&
                    hasSubItems && (
                      <div className="mt-1 ml-5 pl-3 border-l border-gray-600 space-y-1">
                        {subItems.map((sub) => {
                          const translatedSubLabel = t(sub.labelKey);
                          const isSubActive =
                            pathname +
                              (searchParams.toString()
                                ? `?${searchParams.toString()}`
                                : "") ===
                            sub.route;
                          return (
                            <div
                              key={translatedSubLabel}
                              className={`text-sm py-2 px-4 rounded-md cursor-pointer transition-colors duration-150 ${
                                isSubActive
                                  ? "text-indigo-300 font-semibold"
                                  : "text-gray-400 hover:text-white hover:bg-gray-700"
                              }`}
                              role="button"
                              tabIndex={0}
                              onClick={() => navigateTo(sub.route)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  navigateTo(sub.route);
                                }
                              }}
                            >
                              {translatedSubLabel}
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              );
            }
          )
        )}
      </nav>

      <div className="mt-auto p-3 border-t border-gray-700">
        <button
          className={`w-full flex items-center p-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition-colors duration-200 ${
            isCollapsed ? "justify-center" : "justify-end"
          }`}
          onClick={toggleCollapse}
          title={isCollapsed ? t("expandSidebar") : t("collapseSidebar")}
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
