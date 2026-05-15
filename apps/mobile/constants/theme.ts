import { useUserPreferences } from "@/contexts/UserPreferencesContext";

// Brand colors from packages/ui/lib/main.css
const brandColors = {
  green100: "#2b7860", // Brand primary
  green200: "#04ad79", // Brand secondary
  green300: "#d8fdf2", // Light tint
  green400: "#f5fffc", // Very light tint

  red100: "#9b2c2c",
  red200: "#e53e3e",

  gray50: "#f8f9fa",
  gray100: "#131317",
  gray200: "#49494d",
  gray300: "#bbbbbc",
  gray400: "#e8e8e9",
  gray500: "#eceff1",
  gray600: "#374151",
  gray700: "#1f2937",
  gray800: "#111827",
  gray900: "#030712",

  backgroundLight: "#ffffff",
  backgroundDark: "#0a0a0a",
  foregroundLight: "#171717",
  foregroundDark: "#ededed",
};

const baseThemeColors = {
  primary: brandColors.green100,
  primaryContainer: brandColors.green300,
  secondary: brandColors.green200,
  secondaryContainer: brandColors.green400,
  background: brandColors.backgroundLight,
  surface: brandColors.gray50,
  surfaceVariant: brandColors.gray400,
  surfaceDisabled: brandColors.gray500,
  onPrimary: "#ffffff",
  onSecondaryContainer: brandColors.gray100,
  onPrimaryContainer: brandColors.gray100,
  onSurface: brandColors.foregroundLight,
  onSurfaceVariant: brandColors.gray200,
  onSurfaceDisabled: brandColors.gray300,
  error: brandColors.red200,
  errorContainer: "#fee2e2",
  outline: brandColors.gray300,
  outlineVariant: brandColors.gray400,
  backdrop: "rgba(0,0,0,0.4)",
};

export const AppLightTheme = {
  dark: false,
  roundness: 4,
  colors: {
    ...baseThemeColors,
    elevation: {
      level0: "transparent",
      level1: "#f8f9fa",
      level2: "#f1f3f5",
      level3: "#e9ecef",
      level4: "#dee2e6",
      level5: "#ced4da",
    },
  },
};

export const AppDarkTheme = {
  dark: true,
  roundness: 4,
  colors: {
    ...baseThemeColors,
    primary: brandColors.green200, // Brighter green for dark mode
    primaryContainer: brandColors.green100,
    secondary: brandColors.green300,
    secondaryContainer: brandColors.green200,
    background: brandColors.backgroundDark,
    surface: brandColors.gray900,
    surfaceVariant: brandColors.gray800,
    onSurface: brandColors.foregroundDark,
    onSurfaceVariant: brandColors.gray300,
    outline: brandColors.gray700,
    elevation: {
      level0: "transparent",
      level1: "#111827",
      level2: "#1f2937",
      level3: "#2d3748",
      level4: "#374151",
      level5: "#4a5568",
    },
  },
};

export const Colors = {
  light: {
    text: brandColors.foregroundLight,
    background: brandColors.backgroundLight,
    tint: brandColors.green100,
    tabIconDefault: '#ccc',
    tabIconSelected: brandColors.green100,
  },
  dark: {
    text: brandColors.foregroundDark,
    background: brandColors.backgroundDark,
    tint: brandColors.green200,
    tabIconDefault: '#ccc',
    tabIconSelected: brandColors.green200,
  },
};

export const useTheme = () => {
  const { darkMode } = useUserPreferences();
  return darkMode ? AppDarkTheme : AppLightTheme;
};
