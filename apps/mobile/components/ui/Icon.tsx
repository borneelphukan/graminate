import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

type Props = {
  type: keyof typeof MaterialCommunityIcons.glyphMap;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
};

const Icon = ({ type, size = 24, color, style }: Props) => {
  return (
    <MaterialCommunityIcons
      name={type}
      size={size}
      color={color}
      style={style}
    />
  );
};

export { Icon };
