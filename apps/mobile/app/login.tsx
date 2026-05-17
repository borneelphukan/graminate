import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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
} from "@/components/ui";
import { StatusBar } from "expo-status-bar";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const LANGUAGES = [
  { welcome: "Welcome", subtitle: "Sign in to continue" },
  { welcome: "स्वागत है", subtitle: "आगे बढ़ने के लिए साइन इन करें" },
  { welcome: "স্বাগতম", subtitle: "অব্যাহত ৰাখিবলৈ লগইন কৰক" },
];

const AGRI_IMAGES = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000", // Farm
  "https://images.unsplash.com/photo-1595841696667-0f8d167192ea?auto=format&fit=crop&q=80&w=1000", // Tea Garden
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000", // Green field
];

const api = axios.create({
  baseURL: API_URL,
});

const AuthScreen = () => {
  const router = useRouter();
  const { darkMode } = useUserPreferences();

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

  const [langIndex, setLangIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const textFadeAnim = React.useRef(new Animated.Value(1)).current;
  const imageIndexRef = React.useRef(0);

  useEffect(() => {
    // Language Cycling
    const langInterval = setInterval(() => {
      Animated.timing(textFadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setLangIndex((prev) => (prev + 1) % LANGUAGES.length);
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);

    let timeoutId: any;
    
    const runImageTransition = () => {
      timeoutId = setTimeout(() => {
        const current = imageIndexRef.current;
        const next = (current + 1) % AGRI_IMAGES.length;
        
        setNextImageIndex(next);
        
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }).start(() => {
          imageIndexRef.current = next;
          setImageIndex(next);
          fadeAnim.setValue(1);
          runImageTransition();
        });
      }, 5000);
    };

    runImageTransition();

    AGRI_IMAGES.forEach(uri => Image.prefetch(uri));

    return () => {
      clearInterval(langInterval);
      clearTimeout(timeoutId);
    };
  }, [fadeAnim, textFadeAnim]);

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
      const { access_token, user, login_id } = response.data;
      await AsyncStorage.setItem("accessToken", access_token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      if (login_id) {
        await AsyncStorage.setItem("loginId", String(login_id));
      }
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
    <View className="flex-row items-center my-4">
      <Divider className="flex-1" />
      <Text className="mx-4 text-gray-400">
        OR
      </Text>
      <Divider className="flex-1" />
    </View>
  );

  const renderHeader = () => (
    <View className="flex-1 overflow-hidden bg-black">
      <Image
        source={{ uri: AGRI_IMAGES[nextImageIndex] }}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />
      <Animated.Image
        source={{ uri: AGRI_IMAGES[imageIndex] }}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
        style={{ opacity: fadeAnim }}
      />
      
      <View className="absolute inset-0 bg-black/40" />
      
      <View className="flex-1 items-center justify-center py-4 px-4">
        <Animated.View 
          className="items-center justify-center w-full"
          style={{ opacity: textFadeAnim, transform: [{ translateY: textFadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0]
          }) }] }}
        >
          {!isLoginView && (
            <IconButton
              icon="chevron-left"
              onPress={toggleView}
              className="absolute top-0 left-0 z-10"
              iconColor="white"
              size={24}
            />
          )}
          <Text
            variant="headlineSmall"
            className="font-bold text-white text-center"
          >
            {isLoginView ? LANGUAGES[langIndex].welcome : "Create Account"}
          </Text>
          <Text
            variant="bodyMedium"
            className="mt-1 text-white/90 text-center"
          >
            {isLoginView ? LANGUAGES[langIndex].subtitle : "Let's get you started!"}
          </Text>
        </Animated.View>
      </View>
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
        className="py-1 mt-2 rounded-full"
        labelStyle={{ fontSize: 16, fontWeight: "bold" }}
      >
        Sign In
      </Button>
      <View className="flex-row justify-center items-center mt-auto pb-2">
        <Text className="text-dark dark:text-light">Don&apos;t have an account?</Text>
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
        <Text className="text-dark dark:text-light">Already have an account?</Text>
        <Button mode="text" onPress={toggleView}>
          Log In
        </Button>
      </View>
    </ScrollView>
  );

  return (
    <>
      <SafeAreaView
        className="flex-1 bg-white dark:bg-dark"
      >
        <StatusBar
          style="light"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {renderHeader()}
          <View
            className="rounded-t-[40px] p-6 bg-white dark:bg-dark"
            style={{ flex: isLoginView ? 1 : 3 }}
          >
            {isLoginView ? renderLoginForm() : renderRegisterForm()}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Portal>
        <Modal
          visible={isDatePickerVisible}
          onDismiss={() => setDatePickerVisible(false)}
          className="p-5 m-5 rounded-2xl bg-white dark:bg-gray-900"
        >
          <Calendar
            onDayPress={handleDayPress}
            markedDates={
              dateOfBirth
                ? { [dateOfBirth]: { selected: true, disableTouchEvent: true } }
                : {}
            }
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              textSectionTitleColor: darkMode ? "#bbbbbc" : "#49494d",
              selectedDayBackgroundColor: "#2b7860",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#2b7860",
              dayTextColor: darkMode ? "#ededed" : "#171717",
              textDisabledColor: "#bbbbbc",
              arrowColor: "#2b7860",
              monthTextColor: darkMode ? "#ededed" : "#171717",
              indicatorColor: "#2b7860",
            }}
          />
        </Modal>
      </Portal>
    </>
  );
};

export default AuthScreen;
