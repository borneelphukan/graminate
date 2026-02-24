import { Icon } from "@graminate/ui";
import BeeIcon from "@/assets/icon/BeeIcon";
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
            label: "Receipts",
            route: `/${currentUserId}/crm?view=receipts`,
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
          icon: "cruelty_free",
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
    }

    base.push(
      {
        icon: "group",
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
        icon: "attach_money",
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
        icon: "add",
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

  const iconColor = darkMode
    ? theme.colors.onSurface
    : theme.colors.onSurfaceVariant;

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
          <Icon type={"close" as any} size={24} color={iconColor} />
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
                          backgroundColor: theme.colors.surfaceVariant,
                        },
                      ]}
                      onPress={() => handleSectionToggle(section.section)}
                    >
                      <View style={styles.iconWrapper}>
                        {typeof section.icon === "function" ? (
                          <section.icon
                            color={iconColor}
                            width={22}
                            height={22}
                          />
                        ) : (
                          <Icon
                            type={(section.icon) as any}
                            size={20}
                            color={iconColor}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.itemText,
                          { color: theme.colors.onSurface },
                        ]}
                      >
                        {section.label}
                      </Text>
                      <Icon
                        type={(isExpanded ? "expand_more" : "chevron_right") as any}
                        size={14}
                        color={iconColor}
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
                                backgroundColor: theme.colors.surfaceVariant,
                              },
                            ]}
                            onPress={() => handleNavigation(sub.route)}
                          >
                            <Text
                              style={[
                                styles.itemText,
                                styles.subItemText,
                                { color: theme.colors.onSurface },
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
                      backgroundColor: theme.colors.surfaceVariant,
                    },
                  ]}
                  onPress={() => handleNavigation(section.route!)}
                >
                  <View style={styles.iconWrapper}>
                    {typeof section.icon === "function" ? (
                      <section.icon color={iconColor} width={22} height={22} />
                    ) : (
                      <Icon
                        type={(section.icon) as any}
                        size={20}
                        color={iconColor}
                      />
                    )}
                  </View>
                  <Text
                    style={[styles.itemText, { color: theme.colors.onSurface }]}
                  >
                    {section.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <Divider style={styles.divider} />
        <View>
          <View
            style={[styles.itemContainer, { justifyContent: "space-between" }]}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.iconWrapper}>
                <Icon type={"dark_mode" as any} size={20} color={iconColor} />
              </View>
              <Text
                style={[
                  styles.itemText,
                  { color: theme.colors.onSurface, flex: 0 },
                ]}
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
              <Icon type={"settings" as any} size={20} color={iconColor} />
            </View>
            <Text style={[styles.itemText, { color: theme.colors.onSurface }]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { borderTopColor: theme.colors.outlineVariant }]}
      >
        <Button
          mode="contained-tonal"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon={() => (
            <Icon
              type={"logout" as any}
              size={18}
              color={theme.colors.primary}
            />
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
