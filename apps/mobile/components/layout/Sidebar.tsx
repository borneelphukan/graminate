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
  useTheme,
} from "react-native-paper";

interface SidebarProps {
  closeSidebar: () => void;
  userId: string;
}

const Sidebar = ({ closeSidebar, userId }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
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
      subItems: Array<{ label: string; route: string }>;
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

  // Colors from packages/ui/lib/main.css to match web sidebar
  const sidebarBg = "#111827"; // gray-800
  const sidebarActive = "#1f2937"; // gray-700
  const sidebarText = "#bbbbbc"; // gray-300
  const sidebarActiveText = "#ffffff"; // white
  const sidebarItemText = "#e8e8e9"; // gray-400

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: sidebarBg }]}
    >
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
          <Icon type={"close"} size={24} color={sidebarText} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {isSubTypesLoading ? (
          <ActivityIndicator style={styles.loader} />
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
                      style={[
                        styles.itemContainer,
                        isActive && {
                          backgroundColor: sidebarActive,
                        },
                      ]}
                      onPress={() => handleSectionToggle(section.section)}
                    >
                      <View style={styles.iconWrapper}>
                        {typeof section.icon === "function" ? (
                          <section.icon
                            color={isActive ? sidebarActiveText : sidebarText}
                            width={22}
                            height={22}
                          />
                        ) : (
                          <Icon
                            type={(section.icon) as any}
                            size={20}
                            color={isActive ? sidebarActiveText : sidebarText}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.itemText,
                          { color: isActive ? sidebarActiveText : sidebarText },
                        ]}
                      >
                        {section.label}
                      </Text>
                      <Icon
                        type={isExpanded ? "chevron-down" : "chevron-right"}
                        size={14}
                        color={isActive ? sidebarActiveText : sidebarText}
                      />
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={styles.subItemContainer}>
                        {section.subItems.map((sub) => (
                          <TouchableOpacity
                            key={sub.label}
                            style={[
                              styles.itemContainer,
                              styles.subItem,
                              pathname === sub.route && {
                                backgroundColor: sidebarActive,
                              },
                            ]}
                            onPress={() => handleNavigation(sub.route)}
                          >
                            <Text
                              style={[
                                styles.itemText,
                                styles.subItemText,
                                {
                                  color:
                                    pathname === sub.route
                                      ? "#c3dafe" // indigo-300 for active sub-item like web
                                      : sidebarText,
                                },
                              ]}
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
                  style={[
                    styles.itemContainer,
                    isActive && {
                      backgroundColor: sidebarActive,
                    },
                  ]}
                  onPress={() => handleNavigation(section.route!)}
                >
                  <View style={styles.iconWrapper}>
                    {typeof section.icon === "function" ? (
                      <section.icon
                        color={isActive ? sidebarActiveText : sidebarText}
                        width={22}
                        height={22}
                      />
                    ) : (
                      <Icon
                        type={(section.icon) as any}
                        size={20}
                        color={isActive ? sidebarActiveText : sidebarText}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.itemText,
                      { color: isActive ? sidebarActiveText : sidebarText },
                    ]}
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
        style={[styles.footer, { borderTopColor: sidebarActive }]}
      >
        <View
          style={[styles.itemContainer, { justifyContent: "space-between" }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.iconWrapper}>
              <Icon type={"weather-night"} size={20} color={sidebarText} />
            </View>
            <Text
              style={[styles.itemText, { color: sidebarText, flex: 0 }]}
            >
              Dark Mode
            </Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={navigateToSettings}
        >
          <View style={styles.iconWrapper}>
            <Icon type={"cog"} size={20} color={sidebarText} />
          </View>
          <Text style={[styles.itemText, { color: sidebarText }]}>Settings</Text>
        </TouchableOpacity>
        <Divider style={[styles.divider, { marginHorizontal: 0, marginBottom: 16, backgroundColor: sidebarActive }]} />
        <Button
          mode="contained-tonal"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon={() => (
            <Icon type={"logout"} size={18} color={theme.colors.primary} />
          )}
        >
          Logout
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 80,
  },
  logo: { width: 36, height: 36 },
  closeButton: { padding: 8 },
  scrollView: { flex: 1, paddingHorizontal: 8 },
  loader: { marginTop: 40 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  iconWrapper: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemText: { fontSize: 16, flex: 1 },
  subItemContainer: { paddingLeft: 30 },
  subItem: { paddingVertical: 10 },
  subItemText: { fontSize: 15 },
  divider: { marginVertical: 8, marginHorizontal: 16 },
  footer: { padding: 16, borderTopWidth: 1 },
  logoutButton: { paddingVertical: 4 },
});

export default Sidebar;
