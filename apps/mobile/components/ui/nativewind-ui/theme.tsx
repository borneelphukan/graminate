import React, { createContext, useContext } from 'react';

export const brandColors = {
  primary: "#2b7860",
  primaryContainer: "#d8fdf2",
  secondary: "#04ad79",
  secondaryContainer: "#f5fffc",
  background: "#ffffff",
  surface: "#f8f9fa",
  surfaceVariant: "#e8e8e9",
  surfaceDisabled: "#eceff1",
  onPrimary: "#ffffff",
  onSecondaryContainer: "#131317",
  onPrimaryContainer: "#131317",
  onSurface: "#171717",
  onSurfaceVariant: "#49494d",
  onSurfaceDisabled: "#bbbbbc",
  error: "#e53e3e",
  errorContainer: "#fee2e2",
  outline: "#bbbbbc",
  outlineVariant: "#e8e8e9",
  backdrop: "rgba(0,0,0,0.4)",
  elevation: { 
    level0: "transparent", 
    level1: "#f8f9fa", 
    level2: "#f1f3f5", 
    level3: "#e9ecef", 
    level4: "#dee2e6", 
    level5: "#ced4da" 
  }
};

const ThemeContext = createContext({
  colors: brandColors,
  roundness: 4,
  dark: false
});

export const useTheme = () => useContext(ThemeContext);

export const Provider = ({ children, theme }: any) => {
  const activeColors = theme?.colors ? { ...brandColors, ...theme.colors } : brandColors;
  return (
    <ThemeContext.Provider value={{ colors: activeColors, roundness: theme?.roundness ?? 4, dark: theme?.dark || false }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const PaperProvider = Provider;

export const MD3DarkTheme = { colors: brandColors, roundness: 4, dark: true };
export const MD3LightTheme = { colors: brandColors, roundness: 4, dark: false };
