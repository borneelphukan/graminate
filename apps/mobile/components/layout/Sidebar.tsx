import { Icon } from "@/components/ui/Icon";
import BeeIcon from "@/assets/icon/BeeIcon";
import CattleIcon from "@/assets/icon/CattleIcon";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Switch,
  Text,
} from "@/components/ui";

interface SidebarProps {
  closeSidebar: () => void;
  userId: string;
}

const Sidebar = ({ closeSidebar, userId }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams<{ user_id: string }>();
  const currentUserId = userId || params.user_id;

  const {
    darkMode,
    setDarkMode,
    userType,
    subTypes,
    isSubTypesLoading,
    fetchUserSubTypes,
  } = useUserPreferences();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (currentUserId) {
      fetchUserSubTypes(currentUserId);
    }
  }, [currentUserId, fetchUserSubTypes]);

  const sections = useMemo(() => {
    type Section = {
      icon: string | React.ComponentType<any>;
      label: string;
      section: string;
      route?: string;
      basePath?: string;
      color: string;
      subItems: { label: string; route: string }[];
    };

    const base: Section[] = [
      {
        icon: "home",
        label: "Dashboard",
        section: "Dashboard",
        route: `/${currentUserId}`,
        color: "#2b7860", // Graminate Green
        subItems: [],
      },
      {
        icon: "contacts",
        label: "CRM",
        section: "CRM",
        basePath: `/${currentUserId}/crm`,
        color: "#6366F1", // Indigo
        subItems: [
          {
            label: "Contacts",
            route: `/${currentUserId}/crm?view=contacts`,
          },
          {
            label: "Companies",
            route: `/${currentUserId}/crm?view=companies`,
          },
          {
            label: "Contracts",
            route: `/${currentUserId}/crm?view=contracts`,
          },
          {
            label: "Projects",
            route: `/${currentUserId}/crm?view=tasks`,
          },
        ],
      },
    ];

    if (userType === "Producer") {
      if (subTypes.includes("Poultry"))
        base.push({
          icon: "egg",
          label: "Poultry Farm",
          section: "Poultry Farm",
          route: `/${currentUserId}/poultry`,
          color: "#F59E0B",
          subItems: [],
        });
      if (subTypes.includes("Cattle Rearing"))
        base.push({
          icon: CattleIcon,
          label: "Cattle Rearing",
          section: "Cattle Rearing",
          route: `/${currentUserId}/cattle_rearing`,
          color: "#8B4513",
          subItems: [],
        });
      if (subTypes.includes("Apiculture"))
        base.push({
          icon: BeeIcon,
          label: "Apiculture",
          section: "Apiculture",
          route: `/${currentUserId}/apiculture`,
          color: "#EAB308",
          subItems: [],
        });
      if (subTypes.includes("Floriculture"))
        base.push({
          icon: "flower",
          label: "Floriculture",
          section: "Floriculture",
          route: `/${currentUserId}/floriculture`,
          color: "#EC4899",
          subItems: [],
        });
    }

    base.push(
      {
        icon: "account-group",
        label: "Employees",
        section: "Employees",
        basePath: `/${currentUserId}/labour`,
        color: "#10B981",
        subItems: [
          {
            label: "Database",
            route: `/${currentUserId}/labour_database`,
          },
          {
            label: "Salary Manager",
            route: `/${currentUserId}/labour_payment`,
          },
        ],
      },
      {
        icon: "currency-usd",
        label: "Finance Manager",
        section: "Finance",
        basePath: `/${currentUserId}/finance`,
        color: "#059669",
        subItems: [
          {
            label: "Dashboard",
            route: `/${currentUserId}/finance_dashboard`,
          },
          { label: "Sales", route: `/${currentUserId}/finance_sales` },
          {
            label: "Expenses",
            route: `/${currentUserId}/finance_expenses`,
          },
          {
            label: "Loans",
            route: `/${currentUserId}/finance_loans`,
          },
          {
            label: "Receipts",
            route: `/${currentUserId}/finance_receipts`,
          },
        ],
      },
      {
        icon: "warehouse",
        label: "Storage",
        section: "Storage",
        route: `/${currentUserId}/storage`,
        color: "#4B5563",
        subItems: [],
      },
      {
        icon: "plus",
        label: "Manage Services",
        section: "Manage Services",
        route: `/${currentUserId}/add_service`,
        color: "#6B7280",
        subItems: [],
      }
    );
    return base;
  }, [currentUserId, userType, subTypes]);



  const handleNavigation = (route: string) => {
    router.push(route as any);
    closeSidebar();
  };

  const handleSectionToggle = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const navigateToSettings = () => {
    router.push(`/${currentUserId}/settings/settings`);
    closeSidebar();
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-surface">
      <View className="flex-row justify-between items-center px-5 h-16 border-b border-gray-400 dark:border-gray-800">
        <View className="flex-row items-center gap-2.5">
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
          <Text className="text-lg font-black tracking-tighter text-green-100 dark:text-green-200">
            Graminate
          </Text>
        </View>
        <TouchableOpacity
          onPress={closeSidebar}
          className="w-8 h-8 rounded-full items-center justify-center"
        >
          <Icon type={"close"} size={16} className="text-gray-400 dark:text-gray-500" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-3">
        {isSubTypesLoading ? (
          <View className="py-20 justify-center items-center">
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <View className="pb-8">
            {sections.map((section) => {
              const isActive =
                (section.route && pathname === section.route) ||
                (section.basePath && pathname.startsWith(section.basePath));
              const isExpanded = expandedSection === section.section;

              if (section.subItems.length > 0) {
                return (
                  <View key={section.section} className="mb-1">
                    <TouchableOpacity
                      className={`flex-row items-center py-3.5 px-4 rounded-2xl mb-1 ${isExpanded || isActive ? "bg-gray-50 dark:bg-gray-800" : ""}`}
                      onPress={() => handleSectionToggle(section.section)}
                    >
                      <View 
                        style={{ backgroundColor: `${section.color}15` }}
                        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                      >
                        {typeof section.icon === "function" ? (
                          <section.icon size={18} color={section.color} />
                        ) : (
                          <Icon
                            type={(section.icon) as any}
                            size={18}
                            color={section.color}
                          />
                        )}
                      </View>
                      <Text
                        className={`text-[16px] font-bold flex-1 ${isExpanded || isActive ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
                      >
                        {section.label}
                      </Text>
                      <Icon
                        type={isExpanded ? "chevron-down" : "chevron-right"}
                        size={16}
                        className={isExpanded || isActive ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"}
                      />
                    </TouchableOpacity>
                    {isExpanded && (
                      <View className="ml-[22px] border-l border-gray-200 dark:border-gray-800/50 my-1">
                        {section.subItems.map((sub) => {
                          const isSubActive = pathname === sub.route;
                          return (
                            <TouchableOpacity
                              key={sub.label}
                              className="flex-row items-center py-3 pl-8 pr-4"
                              onPress={() => handleNavigation(sub.route)}
                            >
                              <Text
                                className={`text-[15px] ${isSubActive ? "text-green-600 dark:text-green-400 font-bold" : "text-gray-500 dark:text-gray-400 font-medium"}`}
                              >
                                {sub.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={section.section}
                  className={`flex-row items-center py-3.5 px-4 rounded-2xl mb-1 ${isActive ? "bg-gray-500 dark:bg-gray-800" : ""}`}
                  onPress={() => handleNavigation(section.route!)}
                >
                  <View 
                    style={{ backgroundColor: `${section.color}15` }}
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                  >
                    {typeof section.icon === "function" ? (
                      <section.icon size={18} color={section.color} />
                    ) : (
                      <Icon
                        type={(section.icon) as any}
                        size={18}
                        color={section.color}
                      />
                    )}
                  </View>
                  <Text
                    className={`text-[15px] font-semibold flex-1 ${isActive ? "text-green-800 dark:text-green-200" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {section.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View className="p-4 bg-gray-50 dark:bg-dark border-t border-gray-400 dark:border-gray-800">
        <View className="flex-row items-center justify-between py-2 px-4">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg bg-gray-500 dark:bg-gray-800 items-center justify-center mr-3">
              <Icon type="weather-night" size={18} className="text-gray-600 dark:text-gray-400" />
            </View>
            <Text className="text-dark dark:text-light font-bold text-sm">
              Dark Mode
            </Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>

        <TouchableOpacity
          className="flex-row items-center py-3 px-4 rounded-xl mt-1"
          onPress={navigateToSettings}
        >
          <View className="w-8 h-8 rounded-lg bg-gray-500 dark:bg-gray-800 items-center justify-center mr-3">
            <Icon type={"cog"} size={18} className="text-dark dark:text-light" />
          </View>
          <Text className="text-gray-700 dark:text-gray-300 font-bold text-sm">Settings</Text>
        </TouchableOpacity>


      </View>
    </SafeAreaView>
  );
};

export default Sidebar;
