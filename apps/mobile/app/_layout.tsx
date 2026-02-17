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
  MD3DarkTheme,
  MD3LightTheme,
} from "react-native-paper";
import "react-native-reanimated";

import {
  UserPreferencesProvider,
  useUserPreferences,
} from "@/contexts/UserPreferencesContext";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function ThemedApp() {
  const { darkMode } = useUserPreferences();

  const paperTheme = darkMode ? MD3DarkTheme : MD3LightTheme;
  const navigationTheme = darkMode ? DarkTheme : DefaultTheme;

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
