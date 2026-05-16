import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native";
import { Button, Icon, IconButton, Text, TextInput } from "@/components/ui";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { StatusBar } from "expo-status-bar";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const { darkMode } = useUserPreferences();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLinkSent, setIsLinkSent] = useState(false);

  const handleContinue = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/password/forgot", { email });
      setIsLinkSent(true);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send reset link. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderFormView = () => (
    <View className="flex-1 p-6">
      <IconButton
        icon="chevron-left"
        size={28}
        onPress={() => router.back()}
        className="self-start -ml-2"
      />

      <View className="mt-8 flex-1">
        <Text className="font-bold mb-2 text-2xl text-dark dark:text-light">
          Find your profile
        </Text>
        <Text className="mb-8 text-lg text-gray-500 dark:text-gray-400">
          Enter your email address.
        </Text>

        <TextInput
          mode="outlined"
          label="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      <Button
        mode="contained"
        onPress={handleContinue}
        loading={loading}
        disabled={loading}
        className="mt-4"
        labelStyle={{ fontSize: 16, fontWeight: "bold" }}
      >
        Continue
      </Button>
    </View>
  );

  const renderSuccessView = () => (
    <View className="flex-1 items-center justify-center p-8 gap-6">
      <Icon
        source="check-circle"
        size={80}
        className="text-green-100 dark:text-green-200"
      />
      <Text className="font-bold text-center text-dark dark:text-light text-2xl">
        Check Your Email
      </Text>
      <Text className="text-center mb-4 text-gray-500 dark:text-gray-400 text-lg">
        A reset link has been sent to your email. Please check your inbox to
        reset your password on the web.
      </Text>
      <Button
        mode="contained"
        onPress={() => router.back()}
        className="mt-4 w-full"
        labelStyle={{ fontSize: 16, fontWeight: "bold" }}
      >
        Back to Login
      </Button>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark">
      <StatusBar style={darkMode ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {isLinkSent ? renderSuccessView() : renderFormView()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
