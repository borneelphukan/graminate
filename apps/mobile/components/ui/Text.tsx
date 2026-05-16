import React from "react";
import { Text as RNText } from "react-native";

export const Text = ({ children, style, className = "", ...rest }: any) => {
  return (
    <RNText
      className={`text-sm text-gray-600 dark:text-gray-300 ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </RNText>
  );
};

export const HelperText = ({
  children,
  type = "info",
  visible = true,
  className = "",
  style,
}: any) => {
  if (!visible || !children) return null;
  const color = type === "error" ? "text-red-500" : "text-gray-500";
  return (
    <RNText className={`text-xs mt-1 pl-1 ${color} ${className}`} style={style}>
      {children}
    </RNText>
  );
};
