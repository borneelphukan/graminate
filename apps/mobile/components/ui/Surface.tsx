import React from 'react';
import { View } from 'react-native';

export const Surface = ({ children, style, elevation = 1, className = '' }: any) => {
  const elevations = ["shadow-none", "shadow-sm", "shadow", "shadow-md", "shadow-lg", "shadow-xl"];
  const elevationClass = elevations[elevation] || "shadow-sm";
  return (
    <View className={`bg-white dark:bg-[#1e1e1e] rounded-lg ${elevationClass} ${className}`} style={style}>
      {children}
    </View>
  );
};
