import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "react-native-reanimated";
import "../global.css";


import {
  UserPreferencesProvider,
  useUserPreferences,
} from "@/contexts/UserPreferencesContext";
import { AppDarkTheme, AppLightTheme } from "@/constants/theme";
import * as SplashScreen from "expo-splash-screen";
import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  initialRouteName: "index",
};

import { GestureHandlerRootView } from "react-native-gesture-handler";

function ThemedApp() {
  const { darkMode, isPreferencesLoading } = useUserPreferences();
  const [splashAnimationFinished, setSplashAnimationFinished] = React.useState(false);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
        {!splashAnimationFinished && (
          <AnimatedSplashScreen
            isAppReady={!isPreferencesLoading}
            onAnimationComplete={() => setSplashAnimationFinished(true)}
          />
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <UserPreferencesProvider>
      <ThemedApp />
    </UserPreferencesProvider>
  );
}
