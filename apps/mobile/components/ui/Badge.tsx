import React from 'react';
import { View, Text as RNText } from 'react-native';

export const Badge = ({ children, visible = true, size = 20, style, className = '' }: any) => {
  if (!visible) return null;
  return (
    <View className={`bg-[#e53e3e] justify-center items-center rounded-full px-1 bg-red-200 ${className}`} style={[{ minWidth: size, height: size }, style]}>
      <RNText className="text-white text-[10px] font-bold">{children}</RNText>
    </View>
  );
};
