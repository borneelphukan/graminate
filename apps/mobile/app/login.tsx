import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import {
  Button,
  Divider,
  HelperText,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from "@/components/ui";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

const AuthScreen = () => {
  const router = useRouter();
  const theme = useTheme();

  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
    setGeneralError("");
  };

  const toggleView = () => {
    clearErrors();
    const currentEmail = email;
    setEmail(isLoginView ? "" : currentEmail);
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setDateOfBirth("");
    setIsLoginView(!isLoginView);
  };

  const handleDayPress = (day: DateData) => {
    setDateOfBirth(day.dateString);
    setDatePickerVisible(false);
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    clearErrors();
    let isValid = true;

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }
    if (!password.trim()) {
      setPasswordError("Password is required.");
      isValid = false;
    }
    if (!isValid) return;

    setLoading(true);
    try {
      const response = await api.post("/user/login", { email, password });
      const { access_token, user } = response.data;
      await AsyncStorage.setItem("accessToken", access_token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      Alert.alert("Success", "Logged in successfully!");
      router.replace(`/${user.user_id}`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Invalid credentials or server error.";
      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    setLoading(true);
    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber,
      date_of_birth: dateOfBirth,
      password,
    };
    try {
      const response = await api.post("/user/register", payload);
      if (response.status === 201) {
        Alert.alert("Success", "Registration successful! Please log in.");
        toggleView();
      } else {
        Alert.alert(
          "Registration Failed",
          response.data.data.error || "An unknown error occurred."
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.data?.error ||
        error.response?.data?.message ||
        "An unexpected error occurred.";
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const SocialButton = ({
    title,
    iconUri,
  }: {
    title: string;
    iconUri: string;
  }) => (
    <Button
      mode="outlined"
      icon={() => (
        <Image
          source={{ uri: iconUri }}
          className="w-6 h-6 mr-4"
          resizeMode="contain"
        />
      )}
      className="border"
      labelStyle={{ fontSize: 16 }}
      onPress={() =>
        Alert.alert("Social Login", "This feature is coming soon!")
      }
    >
      {title}
    </Button>
  );

  const OrSeparator = () => (
    <View className="flex-row items-center my-6">
      <Divider className="flex-1" />
      <Text variant="labelMedium" className="mx-4">
        OR
      </Text>
      <Divider className="flex-1" />
    </View>
  );

  const renderHeader = () => (
    <View className="items-center justify-center py-8 px-4">
      {!isLoginView && (
        <IconButton
          icon="chevron-left"
          onPress={toggleView}
          className="absolute top-4 left-4 z-10"
          iconColor={theme.colors.onPrimary}
          size={28}
        />
      )}
      <Image
        source={require("@/assets/images/logo.png")}
        className="w-16 h-16 mb-4"
        resizeMode="contain"
      />
      <Text
        variant="headlineLarge"
        className="font-bold"
        style={{ color: theme.colors.onPrimary }}
      >
        {isLoginView ? "Welcome" : "Create Account"}
      </Text>
      <Text
        variant="bodyLarge"
        className="mt-2"
        style={{ color: theme.colors.onPrimaryContainer }}
      >
        {isLoginView ? "Sign in to continue" : "Let's get you started!"}
      </Text>
    </View>
  );

  const renderLoginForm = () => (
    <>
      <SocialButton
        title="Continue with Google"
        iconUri="https://img.icons8.com/color/48/000000/google-logo.png"
      />
      <OrSeparator />
      <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={(text: string) => {
          setEmail(text);
          clearErrors();
        }}
        keyboardType="email-address"
        error={!!emailError}
      />
      <HelperText type="error" visible={!!emailError}>
        {emailError}
      </HelperText>
      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={(text: string) => {
          setPassword(text);
          clearErrors();
        }}
        secureTextEntry
        error={!!passwordError}
      />
      <HelperText type="error" visible={!!passwordError}>
        {passwordError}
      </HelperText>
      <Button
        mode="text"
        onPress={() => router.push("/forgot_password")}
        className="self-end -mt-2"
      >
        Forgot Password?
      </Button>
      <HelperText
        type="error"
        visible={!!generalError}
        className="text-center mb-2"
      >
        {generalError}
      </HelperText>
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        className="py-2 mt-2 rounded-full"
        labelStyle={{ fontSize: 16, fontWeight: "bold" }}
      >
        Sign In
      </Button>
      <View className="flex-row justify-center items-center mt-auto pb-2">
        <Text variant="bodyMedium">Don&apos;t have an account?</Text>
        <Button mode="text" onPress={toggleView}>
          Sign Up
        </Button>
      </View>
    </>
  );

  const renderRegisterForm = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-8"
    >
      <View className="gap-4 mb-6">
        <TextInput
          mode="outlined"
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          mode="outlined"
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          mode="outlined"
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="numeric"
        />
        <TouchableRipple onPress={() => setDatePickerVisible(true)}>
          <TextInput
            mode="outlined"
            label="Date of Birth (Optional)"
            value={dateOfBirth}
            placeholder="YYYY-MM-DD"
            editable={false}
            right={<TextInput.Icon icon="calendar" />}
          />
        </TouchableRipple>
        <TextInput
          mode="outlined"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
        className="py-2 mt-2 rounded-full"
        labelStyle={{ fontSize: 16, fontWeight: "bold" }}
      >
        Create Account
      </Button>
      <OrSeparator />
      <SocialButton
        title="Sign up with Google"
        iconUri="https://img.icons8.com/color/48/000000/google-logo.png"
      />
      <View className="flex-row justify-center items-center mt-auto pb-2">
        <Text variant="bodyMedium">Already have an account?</Text>
        <Button mode="text" onPress={toggleView}>
          Log In
        </Button>
      </View>
    </ScrollView>
  );

  return (
    <>
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme.colors.primary }}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.primary}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {renderHeader()}
          <View
            className="flex-1 rounded-t-[40px] p-8"
            style={{ backgroundColor: theme.colors.background }}
          >
            {isLoginView ? renderLoginForm() : renderRegisterForm()}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Portal>
        <Modal
          visible={isDatePickerVisible}
          onDismiss={() => setDatePickerVisible(false)}
          className="p-5 m-5 rounded-2xl"
          contentContainerStyle={{ backgroundColor: theme.colors.surface }}
        >
          <Calendar
            onDayPress={handleDayPress}
            markedDates={
              dateOfBirth
                ? { [dateOfBirth]: { selected: true, disableTouchEvent: true } }
                : {}
            }
            theme={{
              backgroundColor: theme.colors.surface,
              calendarBackground: theme.colors.surface,
              textSectionTitleColor: theme.colors.onSurfaceVariant,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.onPrimary,
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.onSurface,
              textDisabledColor: theme.colors.onSurfaceDisabled,
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.onSurface,
              indicatorColor: theme.colors.primary,
            }}
          />
        </Modal>
      </Portal>
    </>
  );
};

export default AuthScreen;
