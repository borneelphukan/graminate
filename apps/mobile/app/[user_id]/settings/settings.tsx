import { Icon } from "@/components/ui/Icon";
import BeeIcon from "@/assets/icon/BeeIcon";
import CattleIcon from "@/assets/icon/CattleIcon";
import PlatformLayout from "@/components/layout/PlatformLayout";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, View, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/lib/axiosInstance";
import {
  ActivityIndicator,
  Appbar,
  Card,
  Divider,
  List,
  Avatar,
  Text,
  Button,
} from "@/components/ui";

type SettingsItem = {
  label: string;
  type: "navigate" | "action";
  routeName?: string;
  action?: () => void;
  icon: string | React.ComponentType<{ size: number; color: string }>;
  iconColor: string;
};
type SettingsSection = { label: string; items: SettingsItem[] };

const SettingsScreen = () => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const {
    userType,
    subTypes,
    plan,
    isSubTypesLoading: isLoading,
    fetchUserSubTypes,
  } = useUserPreferences();

  const [user, setUser] = useState<{ name: string; business: string }>({
    name: "",
    business: "",
  });

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    async function fetchUserDetails() {
      if (!user_id) return;
      try {
        const response = await axiosInstance.get(`/user/${user_id}`);
        const data = response.data?.data?.user;
        if (data) {
          setUser({
            name: `${data.first_name} ${data.last_name}`,
            business: data.business_name || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user details in settings:", error);
      }
    }

    if (user_id) {
      fetchUserSubTypes(user_id);
      fetchUserDetails();
    }
  }, [user_id, fetchUserSubTypes]);

  const handleLogout = useCallback(() => {
    const logoutAction = async () => {
      try {
        const loginId = await AsyncStorage.getItem("loginId");
        if (loginId) {
          await axiosInstance.post("/user/logout", { loginId });
        }
      } catch (error) {
        console.error("Logout API failed:", error);
      } finally {
        await AsyncStorage.multiRemove([
          "accessToken",
          "user",
          "loginId",
          "chatMessages",
          "language",
          "timeFormat",
          "temperatureScale",
          "darkMode",
        ]);
        router.replace("/login");
      }
    };

    if (Platform.OS === "web") {
      const confirmLogout = window.confirm("Are you sure you want to log out?");
      if (confirmLogout) {
        logoutAction();
      }
    } else {
      Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: logoutAction,
        },
      ]);
    }
  }, [router]);

  const settingsMenu = useMemo((): SettingsSection[] => {
    const preferenceItems: SettingsItem[] = [
      {
        label: "General",
        type: "navigate",
        routeName: `/${user_id}/settings/general`,
        icon: "cog",
        iconColor: "#4B5563",
      },
    ];
    if (!isLoading) {
      if (userType === "Producer") {
        preferenceItems.push({
          label: "Weather",
          type: "navigate",
          routeName: `/${user_id}/settings/weather`,
          icon: "weather-partly-cloudy",
          iconColor: "#3B82F6",
        });
        if (subTypes.includes("Poultry"))
          preferenceItems.push({
            label: "Poultry",
            type: "navigate",
            routeName: `/${user_id}/settings/poultry`,
            icon: "egg",
            iconColor: "#F59E0B",
          });
        if (subTypes.includes("Cattle Rearing"))
          preferenceItems.push({
            label: "Cattle Rearing",
            type: "navigate",
            routeName: `/${user_id}/settings/cattle-rearing`,
            icon: CattleIcon,
            iconColor: "#8B4513",
          });
        if (subTypes.includes("Apiculture"))
          preferenceItems.push({
            label: "Apiculture",
            type: "navigate",
            routeName: `/${user_id}/settings/apiculture`,
            icon: BeeIcon,
            iconColor: "#EAB308",
          });
        if (subTypes.includes("Floriculture"))
          preferenceItems.push({
            label: "Floriculture",
            type: "navigate",
            routeName: `/${user_id}/settings/floriculture`,
            icon: "flower",
            iconColor: "#EC4899",
          });
      }
    }
    preferenceItems.push({
      label: "Notifications",
      type: "navigate",
      routeName: `/${user_id}/settings/notifications`,
      icon: "bell",
      iconColor: "#8B5CF6",
    });

    return [
      { label: "Preferences", items: preferenceItems },
      {
        label: "Account & Billing",
        items: [
          {
            label: "Billing & Subscription",
            type: "navigate",
            routeName: `/${user_id}/settings/billing`,
            icon: "credit-card-outline",
            iconColor: "#10B981",
          },
          {
            label: "Account Settings",
            type: "navigate",
            routeName: `/${user_id}/settings/account`,
            icon: "account-cog",
            iconColor: "#6366F1",
          },
        ],
      },
      {
        label: "Support",
        items: [
          {
            label: "Help Center",
            type: "navigate",
            routeName: `/${user_id}/settings/help`,
            icon: "help-circle-outline",
            iconColor: "#6B7280",
          },
          {
            label: "About Graminate",
            type: "navigate",
            routeName: `/${user_id}/settings/about`,
            icon: "information-outline",
            iconColor: "#6B7280",
          },
        ],
      },
    ];
  }, [user_id, userType, subTypes, isLoading]);

  const memoizedBackIcon = useCallback(
    () => (
      <Icon
        type={"chevron-left" as any}
        size={22}
        className="text-black dark:text-white"
      />
    ),
    [],
  );

  return (
    <PlatformLayout>
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark">
        <Appbar.Header className="bg-transparent border-none">
          <Appbar.Action
            icon={memoizedBackIcon}
            onPress={() => router.back()}
          />
          <Appbar.Content
            title="Settings"
            titleStyle={{ fontWeight: "800", fontSize: 24 }}
          />
        </Appbar.Header>

        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4 pb-12"
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Section */}
          <Card className="mb-6 border-none shadow-md bg-white dark:bg-dark-surface p-5">
            <View className="flex-row items-center">
              <Avatar.Text
                label={getInitials(user.name) || userType?.[0] || "U"}
                size={60}
                className="bg-green-100 dark:bg-green-900"
                labelStyle={{
                  fontWeight: "bold",
                  fontSize: 24,
                  color: "#2b7860",
                }}
              />
              <View className="ml-4 flex-1">
                {user.name ? (
                  <Text className="text-lg font-extrabold text-black dark:text-white leading-tight mb-0.5">
                    {user.name}
                  </Text>
                ) : null}
                <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {userType || "User"}
                  {user.business ? ` | ${user.business}` : ""}
                </Text>
                <View className="flex-row items-center mt-2">
                  <View className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30">
                    <Text className="text-[10px] font-bold text-green-700 dark:text-green-300 uppercase tracking-tighter">
                      {plan || "Free Plan"}
                    </Text>
                  </View>
                </View>
              </View>
              <Button
                mode="text"
                onPress={() =>
                  router.push(`/${user_id}/settings/account` as any)
                }
                className="min-w-0"
              >
                Edit
              </Button>
            </View>
          </Card>

          {isLoading ? (
            <View className="py-20 justify-center items-center">
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <View className="gap-6">
              {settingsMenu.map((section) => (
                <View key={section.label}>
                  <Text className="text-xs font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 ml-1 mb-3">
                    {section.label}
                  </Text>
                  <Card className="p-0 overflow-hidden border-none shadow-sm bg-white dark:bg-dark-surface">
                    {section.items.map((item, idx) => (
                      <React.Fragment key={item.label}>
                        {idx > 0 && <Divider className="mx-4 opacity-30" />}
                        <List.Item
                          title={item.label}
                          onPress={() => {
                            if (item.type === "navigate" && item.routeName) {
                              router.push(item.routeName as any);
                            } else if (item.type === "action" && item.action) {
                              item.action();
                            }
                          }}
                          titleClassName="text-base font-medium"
                          left={() => (
                            <View
                              style={{ backgroundColor: `${item.iconColor}15` }}
                              className="w-10 h-10 rounded-xl items-center justify-center mr-2"
                            >
                              {typeof item.icon === "function" ? (
                                <item.icon size={20} color={item.iconColor} />
                              ) : (
                                <Icon
                                  type={item.icon as any}
                                  size={20}
                                  color={item.iconColor}
                                />
                              )}
                            </View>
                          )}
                          right={() => (
                            <Icon
                              type="chevron-right"
                              size={18}
                              className="text-gray-300 dark:text-gray-600"
                            />
                          )}
                        />
                      </React.Fragment>
                    ))}
                  </Card>
                </View>
              ))}

              <Button
                mode="outlined"
                onPress={handleLogout}
                className="mt-4 border-red-200 dark:border-red-900/30 rounded-2xl"
                textColor="#ef4444"
                icon={() => <Icon type="logout" size={18} color="#ef4444" />}
              >
                Sign Out
              </Button>

              <View className="items-center mt-6">
                <Text className="text-gray-400 dark:text-gray-600 text-xs">
                  Graminate v1.0.0
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </PlatformLayout>
  );
};

export default SettingsScreen;
