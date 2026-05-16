import { Icon } from "@/components/ui/Icon";
import BeeIcon from "@/assets/icon/BeeIcon";
import CattleIcon from "@/assets/icon/CattleIcon";
import PlatformLayout from "@/components/layout/PlatformLayout";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Card,
  Divider,
  List,
} from "@/components/ui";

type SettingsItem = {
  label: string;
  type: "navigate";
  routeName?: string;
  icon: string | React.ComponentType<{ size: number; color: string }>;
};
type SettingsSection = { label: string; items: SettingsItem[] };

const SettingsScreen = () => {
  const router = useRouter();
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const {
    userType,
    subTypes,
    isSubTypesLoading: isLoading,
    fetchUserSubTypes,
  } = useUserPreferences();

  useEffect(() => {
    if (user_id) {
      fetchUserSubTypes(user_id);
    }
  }, [user_id, fetchUserSubTypes]);

  const settingsMenu = useMemo((): SettingsSection[] => {
    const preferenceItems: SettingsItem[] = [
      {
        label: "General",
        type: "navigate",
        routeName: `/${user_id}/settings/general`,
        icon: "cog",
      },
    ];
    if (!isLoading) {
      if (userType === "Producer") {
        preferenceItems.push({
          label: "Weather",
          type: "navigate",
          routeName: `/${user_id}/settings/weather`,
          icon: "weather-partly-cloudy",
        });
        if (subTypes.includes("Poultry"))
          preferenceItems.push({
            label: "Poultry",
            type: "navigate",
            routeName: `/${user_id}/settings/poultry`,
            icon: "egg",
          });
        if (subTypes.includes("Cattle Rearing"))
          preferenceItems.push({
            label: "Cattle Rearing",
            type: "navigate",
            routeName: `/${user_id}/settings/cattle-rearing`,
            icon: CattleIcon,
          });
        if (subTypes.includes("Apiculture"))
          preferenceItems.push({
            label: "Apiculture",
            type: "navigate",
            routeName: `/${user_id}/settings/apiculture`,
            icon: BeeIcon,
          });
        if (subTypes.includes("Floriculture"))
          preferenceItems.push({
            label: "Floriculture",
            type: "navigate",
            routeName: `/${user_id}/settings/floriculture`,
            icon: "flower",
          });
      }
    }
    preferenceItems.push({
      label: "Notifications",
      type: "navigate",
      routeName: `/${user_id}/settings/notifications`,
      icon: "bell",
    });
    return [
      { label: "Your Preferences", items: preferenceItems },
      {
        label: "Account",
        items: [
          {
            label: "Billing",
            type: "navigate",
            routeName: `/${user_id}/settings/billing`,
            icon: "credit-card-outline",
          },
          {
            label: "Account Settings",
            type: "navigate",
            routeName: `/${user_id}/settings/account`,
            icon: "account-cog",
          },
        ],
      },
    ];
  }, [user_id, userType, subTypes, isLoading]);

  // Colors from Navbar to match theme


  const memoizedBackIcon = useCallback(
    () => (
      <Icon
        type={"chevron-left" as any}
        size={22}
        className="text-black dark:text-white"
      />
    ),
    []
  );

  return (
    <PlatformLayout>
      <SafeAreaView
        className="flex-1 bg-white dark:bg-gray-900"
      >
        <Appbar.Header>
          <Appbar.Action
            icon={memoizedBackIcon}
            onPress={() => router.back()}
          />
          <Appbar.Content
            title="Settings"
          />
        </Appbar.Header>
        <View className="flex-1">
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <ScrollView contentContainerClassName="p-4 gap-6">
              {settingsMenu.map((section) => (
                <Card key={section.label} className="p-0 overflow-hidden">
                  <List.Subheader style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
                    {section.label}
                  </List.Subheader>
                  {section.items.map((item, idx) => (
                    <React.Fragment key={item.label}>
                      {idx > 0 && <Divider className="my-0" />}
                      <List.Item
                        title={item.label}
                        onPress={() =>
                          item.routeName && router.push(item.routeName as any)
                        }
                      left={(props: any) => {
                        let iconElement;
                        if (typeof item.icon === "function") {
                          const CustomIcon = item.icon;
                          iconElement = (
                            <CustomIcon size={22} color={props.color} />
                          );
                        } else {
                          iconElement = (
                            <Icon
                              type={(item.icon) as any}
                              size={22}
                              color={props.color}
                            />
                          );
                        }
                        return (
                          <List.Icon {...props} icon={() => iconElement} />
                        );
                      }}
                      right={(props: any) => (
                        <List.Icon
                          {...props}
                          icon={() => (
                            <Icon
                              type={"chevron-right" as any}
                              size={16}
                              color={props.color}
                            />
                          )}
                        />
                      )}
                    />
                    </React.Fragment>
                  ))}
                </Card>
              ))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </PlatformLayout>
  );
};

export default SettingsScreen;
