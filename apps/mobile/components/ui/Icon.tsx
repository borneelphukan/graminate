import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { OpaqueColorValue, StyleProp, TextStyle } from "react-native";
import { cssInterop } from "nativewind";

type Props = {
  type?: keyof typeof MaterialCommunityIcons.glyphMap | string;
  source?: keyof typeof MaterialCommunityIcons.glyphMap | string;
  size?: number;
  color?: string | OpaqueColorValue;
  className?: string;
  style?: StyleProp<TextStyle>;
};

const Icon = ({ type, source, size = 24, color, style }: Props) => {
  return (
    <MaterialCommunityIcons
      name={(type || source) as any}
      size={size}
      color={color || '#49494d'}
      style={style}
    />
  );
};

cssInterop(Icon, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
    },
  },
});

export { Icon };
export type IconSource = string;
