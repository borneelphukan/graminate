import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { SupportedLanguage } from "@/translations";
import axiosInstance from "@/lib/utils/axiosInstance";

export type TimeFormatOption = "12-hour" | "24-hour";
export type TemperatureScaleOption = "Celsius" | "Fahrenheit";

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
  setCountry: (country: string | null) => void;
  subTypes: string[];
  entityType: string | null;
  setEntityType: (type: string | null) => void;
  isSubTypesLoading: boolean;
  fetchUserSubTypes: (userId: string | number) => Promise<void>;
  setUserSubTypes: (subTypes: string[]) => void;
  widgets: string[];
  setWidgets: (widgets: string[]) => void;
  updateUserWidgets: (
    userId: string | number,
    widgets: string[]
  ) => Promise<void>;
};

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined);

export const UserPreferencesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [timeFormat, setTimeFormatState] = useState<TimeFormatOption>(() => {
    if (typeof window !== "undefined") {
      const storedFormat = localStorage.getItem(
        "timeFormat"
      ) as TimeFormatOption;
      if (storedFormat === "12-hour" || storedFormat === "24-hour") {
        return storedFormat;
      }
    }
    return "24-hour";
  });

  const [temperatureScale, setTemperatureScaleState] =
    useState<TemperatureScaleOption>(() => {
      if (typeof window !== "undefined") {
        const storedScale = localStorage.getItem(
          "temperatureScale"
        ) as TemperatureScaleOption;
        if (storedScale === "Celsius" || storedScale === "Fahrenheit") {
          return storedScale;
        }
      }
      return "Celsius";
    });

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem(
        "language"
      ) as SupportedLanguage;
      if (
        storedLanguage &&
        (storedLanguage === "English" ||
          storedLanguage === "Hindi" ||
          storedLanguage === "Assamese")
      ) {
        return storedLanguage;
      }
    }
    return "English";
  });

  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const storedDarkMode = localStorage.getItem("darkMode");
      return storedDarkMode === "true";
    }
    return false;
  });

  const [isFirstLogin, setIsFirstLoginState] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [subTypes, setSubTypesState] = useState<string[]>([]);
  const [entityType, setEntityType] = useState<string | null>(null);
  const [widgets, setWidgetsState] = useState<string[]>([]);
  const [isSubTypesLoading, setIsSubTypesLoading] = useState(true);

  const setTimeFormatContext = useCallback((format: TimeFormatOption) => {
    setTimeFormatState(format);
    if (typeof window !== "undefined") {
      localStorage.setItem("timeFormat", format);
    }
  }, []);

  const setTemperatureScaleContext = useCallback(
    (scale: TemperatureScaleOption) => {
      setTemperatureScaleState(scale);
      if (typeof window !== "undefined") {
        localStorage.setItem("temperatureScale", scale);
      }
    },
    []
  );

  const setLanguageContext = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  }, []);

  const setDarkModeContext = useCallback((enabled: boolean) => {
    setDarkModeState(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", String(enabled));
    }
  }, []);

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
    if (!userId || userId === "undefined" || userId === "null") {
      console.warn("fetchUserSubTypes called with invalid userId:", userId);
      setIsSubTypesLoading(false);
      return;
    }
    setIsSubTypesLoading(true);
    try {
      const response = await axiosInstance.get(`/user/${userId}`);
      
      // Handle the { status, data: { user } } format from repository
      const user = response.data?.data?.user ?? response.data?.user;
      
      if (!user) {
        if (response.data?.status === 404) {
          console.warn(`User ${userId} not found, clearing session`);
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          return;
        }
        console.error("fetchUserSubTypes: User missing in response data", response.data);
        throw new Error("User payload missing from server response");
      }

      setIsFirstLoginState(!user.business_name);
      setUserType(user.type || "Producer");
      setPlan(user.plan || null);
      setCountry(user.country || null);
      setSubTypesState(Array.isArray(user.sub_type) ? user.sub_type : []);
      setEntityType(user.entity_type || null);
      setWidgetsState(Array.isArray(user.widgets) ? user.widgets : []);
    } catch (error) {
      console.error("Error fetching user sub_types:", error);
      setIsFirstLoginState(true);
      setUserType("Producer");
      setPlan(null);
      setCountry(null);
      setSubTypesState([]);
      setWidgetsState([]);
      throw error;
    } finally {
      setIsSubTypesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [darkMode]);

  return (
    <UserPreferencesContext.Provider
      value={{
        timeFormat,
        setTimeFormat: setTimeFormatContext,
        temperatureScale,
        setTemperatureScale: setTemperatureScaleContext,
        language,
        setLanguage: setLanguageContext,
        darkMode,
        setDarkMode: setDarkModeContext,
        isFirstLogin,
        setIsFirstLogin,
        userType,
        plan,
        country,
        setCountry,
        subTypes,
        entityType,
        setEntityType,
        isSubTypesLoading,
        fetchUserSubTypes,
        setUserSubTypes,
        widgets,
        setWidgets,
        updateUserWidgets,
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

export type { SupportedLanguage };
