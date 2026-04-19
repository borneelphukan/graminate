import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

export type TimeFormatOption = "12-hour" | "24-hour";

type UserPreferencesContextType = {
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  timeFormat: TimeFormatOption;
  setTimeFormat: (format: TimeFormatOption) => void;
  widgets: string[];
  setWidgets: (widgets: string[]) => void;
  updateUserWidgets: (
    adminId: string | number,
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
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const storedDarkMode = localStorage.getItem("darkMode");
      return storedDarkMode === "true";
    }
    return false;
  });

  const [timeFormat, setTimeFormatState] = useState<TimeFormatOption>(() => {
    if (typeof window !== "undefined") {
      const storedFormat = localStorage.getItem("timeFormat") as TimeFormatOption;
      if (storedFormat === "12-hour" || storedFormat === "24-hour") {
        return storedFormat;
      }
    }
    return "24-hour";
  });

  const [widgets, setWidgetsState] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const storedWidgets = localStorage.getItem("admin_widgets");
      if (storedWidgets) {
        try {
          return JSON.parse(storedWidgets);
        } catch (e) {
          return ["Total Users", "Plan Distribution"];
        }
      }
    }
    return ["Total Users", "Plan Distribution"];
  });

  const setDarkMode = useCallback((enabled: boolean) => {
    setDarkModeState(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", String(enabled));
    }
  }, []);

  const setTimeFormat = useCallback((format: TimeFormatOption) => {
    setTimeFormatState(format);
    if (typeof window !== "undefined") {
      localStorage.setItem("timeFormat", format);
    }
  }, []);

  const setWidgets = useCallback((newWidgets: string[]) => {
    setWidgetsState(newWidgets);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_widgets", JSON.stringify(newWidgets));
    }
  }, []);

  const updateUserWidgets = useCallback(
    async (adminId: string | number, newWidgets: string[]) => {
      // In Admin, we primarily use localStorage since there might not be a 'widgets' column yet
      setWidgets(newWidgets);
    },
    [setWidgets]
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <UserPreferencesContext.Provider
      value={{
        darkMode,
        setDarkMode,
        timeFormat,
        setTimeFormat,
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
