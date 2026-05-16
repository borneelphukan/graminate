import React from 'react';
import { View, Text as RNText } from 'react-native';

export const Badge = ({ children, visible = true, className = '' }: any) => {
  if (!visible) return null;
  return (
    <View className={`justify-center items-center rounded-full px-1 bg-red-200 ${className}`}>
      <RNText className="text-light text-xs uppercase font-bold">{children}</RNText>
    </View>
  );
};
