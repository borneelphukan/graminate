import { Icon } from "@/components/ui/Icon";
import BeeIcon from "@/assets/icon/BeeIcon";
import CattleIcon from "@/assets/icon/CattleIcon";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Divider,
  Switch,
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
      subItems: { label: string; route: string }[];
    };

    const base: Section[] = [
      {
        icon: "home",
        label: "Dashboard",
        section: "Dashboard",
        route: `/${currentUserId}`,
        subItems: [],
      },
      {
        icon: "contacts",
        label: "CRM",
        section: "CRM",
        basePath: `/${currentUserId}/crm`,
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
          subItems: [],
        });
      if (subTypes.includes("Cattle Rearing"))
        base.push({
          icon: CattleIcon,
          label: "Cattle Rearing",
          section: "Cattle Rearing",
          route: `/${currentUserId}/cattle_rearing`,
          subItems: [],
        });
      if (subTypes.includes("Apiculture"))
        base.push({
          icon: BeeIcon,
          label: "Apiculture",
          section: "Apiculture",
          route: `/${currentUserId}/apiculture`,
          subItems: [],
        });
      if (subTypes.includes("Floriculture"))
        base.push({
          icon: "flower",
          label: "Floriculture",
          section: "Floriculture",
          route: `/${currentUserId}/floriculture`,
          subItems: [],
        });
    }

    base.push(
      {
        icon: "account-group",
        label: "Employees",
        section: "Employees",
        basePath: `/${currentUserId}/labour`,
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
        subItems: [],
      },
      {
        icon: "plus",
        label: "Manage Services",
        section: "Manage Services",
        route: `/${currentUserId}/add_service`,
        subItems: [],
      }
    );
    return base;
  }, [currentUserId, userType, subTypes]);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove([
      "accessToken",
      "user",
      "chatMessages",
      "language",
      "timeFormat",
      "temperatureScale",
      "darkMode",
    ]);
    router.replace("/login");
    closeSidebar();
  };

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
    <SafeAreaView
      className="flex-1 bg-gray-800"
    >
      <View className="flex-row justify-between items-center px-4 h-20">
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={closeSidebar} className="p-2">
          <Icon type={"close"} size={24} className="text-light" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-2">
        {isSubTypesLoading ? (
          <ActivityIndicator className="mt-10" />
        ) : (
          <View>
            {sections.map((section) => {
              const isActive =
                (section.route && pathname === section.route) ||
                (section.basePath && pathname.startsWith(section.basePath));
              const isExpanded = expandedSection === section.section;

              if (section.subItems.length > 0) {
                return (
                  <View key={section.section}>
                    <TouchableOpacity
                      className={`flex-row items-center py-3 px-4 rounded-lg mb-1 ${isActive ? "bg-gray-700" : ""}`}
                      onPress={() => handleSectionToggle(section.section)}
                    >
                      <View className="w-8 items-center justify-center mr-3">
                        {typeof section.icon === "function" ? (
                          <section.icon
                            className="text-light"
                            size={22}
                          />
                        ) : (
                          <Icon
                            type={(section.icon) as any}
                            size={20}
                            className="text-light"
                          />
                        )}
                      </View>
                      <Text
                        className={`text-base flex-1 text-light`}
                      >
                        {section.label}
                      </Text>
                      <Icon
                        type={isExpanded ? "chevron-down" : "chevron-right"}
                        size={14}
                        className="text-light"
                      />
                    </TouchableOpacity>
                    {isExpanded && (
                      <View className="pl-8">
                        {section.subItems.map((sub) => (
                          <TouchableOpacity
                            key={sub.label}
                            className={`flex-row items-center py-2.5 px-4 rounded-lg mb-1 ${pathname === sub.route ? "bg-gray-700" : ""}`}
                            onPress={() => handleNavigation(sub.route)}
                          >
                            <Text
                              className={`text-sm ${pathname === sub.route ? "text-indigo-300" : "text-light"}`}
                            >
                              {sub.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={section.section}
                  className={`flex-row items-center py-3 px-4 rounded-lg mb-1 ${isActive ? "bg-gray-700" : ""}`}
                  onPress={() => handleNavigation(section.route!)}
                >
                  <View className="w-8 items-center justify-center mr-3">
                    {typeof section.icon === "function" ? (
                      <section.icon
                        className="text-light"
                        size={22}
                      />
                    ) : (
                          <Icon
                            type={(section.icon) as any}
                            size={20}
                            className="text-light"
                          />
                        )}
                      </View>
                      <Text
                        className={`text-base flex-1 text-light`}
                      >
                        {section.label}
                      </Text>
                    </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View
        className="p-4 border-t border-gray-700"
      >
        <View
          className="flex-row items-center justify-between py-3 px-4 rounded-lg mb-1"
        >
          <View className="flex-row items-center">
            <View className="w-8 items-center justify-center mr-3">
              <Icon type="weather-night" size={20} className="text-white" />
            </View>
            <Text
              className="text-white text-base"
            >
              Dark Mode
            </Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <TouchableOpacity
          className="flex-row items-center py-3 px-4 rounded-lg mb-1"
          onPress={navigateToSettings}
        >
          <View className="w-8 items-center justify-center mr-3">
            <Icon type={"cog"} size={20} className="text-light" />
          </View>
          <Text className="text-light text-base">Settings</Text>
        </TouchableOpacity>
        <Divider className="mb-4 bg-gray-600" />
        <Button
          onPress={handleLogout}
        >
          Logout
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default Sidebar;
