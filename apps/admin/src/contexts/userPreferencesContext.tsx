import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

type UserPreferencesContextType = {
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
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

  const setDarkMode = useCallback((enabled: boolean) => {
    setDarkModeState(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", String(enabled));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <UserPreferencesContext.Provider value={{ darkMode, setDarkMode }}>
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
