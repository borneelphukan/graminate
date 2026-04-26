import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Provider as PaperProvider,
} from "react-native-paper";
import "react-native-reanimated";

import {
  UserPreferencesProvider,
  useUserPreferences,
} from "@/contexts/UserPreferencesContext";
import { AppDarkTheme, AppLightTheme } from "@/constants/theme";

export const unstable_settings = {
  initialRouteName: "index",
};

function ThemedApp() {
  const { darkMode } = useUserPreferences();

  const paperTheme = darkMode ? AppDarkTheme : AppLightTheme;
  const navigationTheme = darkMode
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: AppDarkTheme.colors.primary,
          background: AppDarkTheme.colors.background,
          card: AppDarkTheme.colors.surface,
          text: AppDarkTheme.colors.onSurface,
          border: AppDarkTheme.colors.outline,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: AppLightTheme.colors.primary,
          background: AppLightTheme.colors.background,
          card: AppLightTheme.colors.surface,
          text: AppLightTheme.colors.onSurface,
          border: AppLightTheme.colors.outline,
        },
      };

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="forgot_password" />
          <Stack.Screen name="[user_id]" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style={darkMode ? "light" : "dark"} />
      </ThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <UserPreferencesProvider>
      <ThemedApp />
    </UserPreferencesProvider>
  );
}
