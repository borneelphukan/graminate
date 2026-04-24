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
  List,
  useTheme,
} from "react-native-paper";

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
  const theme = useTheme();

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
  const navbarBg = "#1f2937"; // gray-800 (slightly lighter than navbar gray-900)
  const navbarIconColor = "#bbbbbc"; // gray-300
  const navbarBorder = "#374151"; // gray-700

  const memoizedBackIcon = useCallback(
    () => (
      <Icon
        type={"arrow-left" as any}
        size={22}
        color={navbarIconColor}
      />
    ),
    [navbarIconColor]
  );

  return (
    <PlatformLayout>
      <SafeAreaView
        style={[styles.flex, { backgroundColor: theme.colors.background }]}
      >
        <Appbar.Header
          style={{
            backgroundColor: navbarBg,
            borderBottomWidth: 1,
            borderBottomColor: navbarBorder,
          }}
        >
          <Appbar.Action
            icon={memoizedBackIcon}
            onPress={() => router.back()}
          />
          <Appbar.Content
            title="Settings"
            titleStyle={{ color: "white", fontWeight: "bold" }}
          />
        </Appbar.Header>
        <View style={styles.flex}>
          {isLoading ? (
            <View style={styles.centeredContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.container}>
              {settingsMenu.map((section) => (
                <Card key={section.label} style={styles.card}>
                  <List.Subheader>{section.label}</List.Subheader>
                  {section.items.map((item) => (
                    <List.Item
                      key={item.label}
                      title={item.label}
                      onPress={() =>
                        item.routeName && router.push(item.routeName as any)
                      }
                      left={(props) => {
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
                      right={(props) => (
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: { padding: 16, gap: 24 },
  card: {},
});

export default SettingsScreen;
