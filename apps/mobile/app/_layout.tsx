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
import * as SplashScreen from "expo-splash-screen";
import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  initialRouteName: "index",
};

function ThemedApp() {
  const { darkMode, isPreferencesLoading } = useUserPreferences();
  const [splashAnimationFinished, setSplashAnimationFinished] = React.useState(false);

  const navigationTheme = darkMode
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: "#04ad79",
          background: "#0a0a0a",
          card: "#030712",
          text: "#ededed",
          border: "#1f2937",
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: "#2b7860",
          background: "#ffffff",
          card: "#f8f9fa",
          text: "#171717",
          border: "#e8e8e9",
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
