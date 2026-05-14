import React from 'react';
import { View, Text as RNText, TouchableOpacity } from 'react-native';

export const Card = ({ children, style, className = '', onPress }: any) => {
  const Comp = onPress ? TouchableOpacity : View;
  return (
    <Comp onPress={onPress} className={`bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden p-4 my-2 ${className}`} style={style}>
      {children}
    </Comp>
  );
};

Card.Title = ({ title, subtitle, left, right, titleVariant, subtitleVariant }: any) => (
  <View className="flex-row items-center justify-between mb-2">
    <View className="flex-row items-center flex-1">
      {left && <View className="mr-3">{left()}</View>}
      <View className="flex-1">
        <RNText className="text-base font-bold text-gray-900 dark:text-gray-100">{title}</RNText>
        {subtitle && <RNText className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</RNText>}
      </View>
    </View>
    {right && <View>{right()}</View>}
  </View>
);

Card.Content = ({ children, style, className = '' }: any) => <View className={`py-1 ${className}`} style={style}>{children}</View>;
Card.Actions = ({ children, style, className = '' }: any) => <View className={`flex-row items-center justify-end pt-3 gap-2 ${className}`} style={style}>{children}</View>;
Card.Cover = ({ source, style, className = '' }: any) => <View className="h-48 bg-gray-200 dark:bg-gray-800 w-full mb-2" style={style} />;
