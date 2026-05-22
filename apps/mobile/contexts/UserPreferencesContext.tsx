import axiosInstance from "@/lib/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type TimeFormatOption = "12-hour" | "24-hour";
export type TemperatureScaleOption = "Celsius" | "Fahrenheit";
export type SupportedLanguage = "English" | "Hindi" | "Assamese";

type UserPreferencesContextType = {
  timeFormat: TimeFormatOption;
  setTimeFormat: (format: TimeFormatOption) => void;
  temperatureScale: TemperatureScaleOption;
  setTemperatureScale: (scale: TemperatureScaleOption) => void;
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  isFirstLogin: boolean;
  setIsFirstLogin: (isFirst: boolean) => void;
  userType: string | null;
  plan: string | null;
  country: string | null;
  subTypes: string[];
  isSubTypesLoading: boolean;
  fetchUserSubTypes: (userId: string | number) => Promise<void>;
  setUserSubTypes: (subTypes: string[]) => void;
  widgets: string[];
  setWidgets: (widgets: string[]) => void;
  updateUserWidgets: (
    userId: string | number,
    widgets: string[]
  ) => Promise<void>;
  isPreferencesLoading: boolean;
};

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
 >(undefined);

export const UserPreferencesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const systemTheme = useColorScheme();
  const [timeFormat, setTimeFormatState] =
    useState<TimeFormatOption>("24-hour");
  const [temperatureScale, setTemperatureScaleState] =
    useState<TemperatureScaleOption>("Celsius");
  const [language, setLanguageState] = useState<SupportedLanguage>("English");
  const [darkMode, setDarkModeState] = useState<boolean>(
    systemTheme === "dark"
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFirstLogin, setIsFirstLoginState] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [subTypes, setSubTypesState] = useState<string[]>([]);
  const [widgets, setWidgetsState] = useState<string[]>([]);
  const [isSubTypesLoading, setIsSubTypesLoading] = useState(true);
  const [isPreferencesLoading, setIsPreferencesLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedTimeFormat = (await AsyncStorage.getItem(
          "timeFormat"
        )) as TimeFormatOption;
        const storedTempScale = (await AsyncStorage.getItem(
          "temperatureScale"
        )) as TemperatureScaleOption;
        const storedLanguage = (await AsyncStorage.getItem(
          "language"
        )) as SupportedLanguage;
        const storedDarkMode = await AsyncStorage.getItem("darkMode");

        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          if (user?.user_id) {
            const uid = String(user.user_id);
            setCurrentUserId(uid);
            
            // Sync with backend on startup
            try {
              const response = await axiosInstance.get(`/user/${uid}`);
              const fetchedUser = response.data?.data?.user ?? response.data?.user;
              if (fetchedUser && fetchedUser.darkMode !== undefined) {
                setDarkModeState(!!fetchedUser.darkMode);
                await AsyncStorage.setItem("darkMode", String(fetchedUser.darkMode));
              }
            } catch (err) {
              console.error("Failed to load dark mode from backend on mount:", err);
            }
          }
        }

        if (storedTimeFormat) setTimeFormatState(storedTimeFormat);
        if (storedTempScale) setTemperatureScaleState(storedTempScale);
        if (storedLanguage) setLanguageState(storedLanguage);
        if (storedDarkMode !== null && !userString)
          setDarkModeState(storedDarkMode === "true");
      } catch (e) {
        console.error("Failed to load preferences from storage", e);
      } finally {
        setIsPreferencesLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const setTimeFormat = useCallback((format: TimeFormatOption) => {
    setTimeFormatState(format);
    AsyncStorage.setItem("timeFormat", format);
  }, []);

  const setTemperatureScale = useCallback((scale: TemperatureScaleOption) => {
    setTemperatureScaleState(scale);
    AsyncStorage.setItem("temperatureScale", scale);
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    AsyncStorage.setItem("language", lang);
  }, []);

  const setDarkMode = useCallback(async (enabled: boolean) => {
    setDarkModeState(enabled);
    await AsyncStorage.setItem("darkMode", String(enabled));
    if (currentUserId) {
      try {
        await axiosInstance.put(`/user/${currentUserId}`, { darkMode: enabled });
      } catch (error) {
        console.error("Failed to sync dark mode change to backend:", error);
      }
    }
  }, [currentUserId]);

  const setIsFirstLogin = useCallback((isFirst: boolean) => {
    setIsFirstLoginState(isFirst);
  }, []);

  const setUserSubTypes = useCallback((newSubTypes: string[]) => {
    setSubTypesState(newSubTypes);
  }, []);

  const setWidgets = useCallback((newWidgets: string[]) => {
    setWidgetsState(newWidgets);
  }, []);

  const updateUserWidgets = useCallback(
    async (userId: string | number, newWidgets: string[]) => {
      try {
        await axiosInstance.put(`/user/${userId}`, { widgets: newWidgets });
        setWidgets(newWidgets);
      } catch (error) {
        console.error("Failed to update user widgets:", error);
        throw error;
      }
    },
    [setWidgets]
  );

  const fetchUserSubTypes = useCallback(async (userId: string | number) => {
    setIsSubTypesLoading(true);
    const uidStr = String(userId);
    setCurrentUserId(uidStr);
    try {
      const response = await axiosInstance.get(`/user/${userId}`);
      const user = response.data?.data?.user ?? response.data?.user;
      if (!user) throw new Error("User payload missing");

      setIsFirstLoginState(!user.business_name);
      setUserType(user.type || "Producer");
      setPlan(user.plan || null);
      setCountry(user.country || null);
      setSubTypesState(Array.isArray(user.sub_type) ? user.sub_type : []);
      setWidgetsState(Array.isArray(user.widgets) ? user.widgets : []);
      
      if (user.darkMode !== undefined) {
        setDarkModeState(!!user.darkMode);
        await AsyncStorage.setItem("darkMode", String(user.darkMode));
      }
    } catch (err) {
      console.error("Error fetching user sub_types:", err);
      setIsFirstLoginState(true);
      setUserType("Producer");
      setPlan(null);
      setCountry(null);
      setSubTypesState([]);
      setWidgetsState([]);
    } finally {
      setIsSubTypesLoading(false);
    }
  }, []);

  return (
    <UserPreferencesContext.Provider
      value={{
        timeFormat,
        setTimeFormat,
        temperatureScale,
        setTemperatureScale,
        language,
        setLanguage,
        darkMode,
        setDarkMode,
        isFirstLogin,
        setIsFirstLogin,
        userType,
        plan,
        country,
        subTypes,
        isSubTypesLoading,
        fetchUserSubTypes,
        setUserSubTypes,
        widgets,
        setWidgets,
        updateUserWidgets,
        isPreferencesLoading,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider"
    );
  }
  return context;
};
