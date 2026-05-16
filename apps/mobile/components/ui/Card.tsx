import React from 'react';
import { View, Text as RNText, TouchableOpacity } from 'react-native';

export const Card = ({ children, style, className = '', onPress }: any) => {
  const Comp = onPress ? TouchableOpacity : View;
  const hasPadding = className.match(/p[xy]?-\d+/) !== null;
  const paddingClass = hasPadding ? '' : 'p-4';
  return (
    <Comp onPress={onPress} className={`bg-light dark:bg-gray-700 border border-gray-400 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden my-2 ${paddingClass} ${className}`} style={style}>
      {children}
    </Comp>
  );
};

Card.Title = ({ title, subtitle, left, right, titleVariant, subtitleVariant }: any) => (
  <View className="flex-row items-center justify-between mb-2">
    <View className="flex-row items-center flex-1">
      {left && <View className="mr-3">{left()}</View>}
      <View className="flex-1">
        <RNText className="text-base font-bold text-dark dark:text-light">{title}</RNText>
        {subtitle && <RNText className="text-xs text-dark dark:text-light mt-0.5">{subtitle}</RNText>}
      </View>
    </View>
    {right && <View>{right()}</View>}
  </View>
);

Card.Content = ({ children, style, className = '' }: any) => <View className={`py-1 ${className}`} style={style}>{children}</View>;
Card.Actions = ({ children, style, className = '' }: any) => <View className={`flex-row items-center justify-end pt-3 gap-2 ${className}`} style={style}>{children}</View>;
Card.Cover = ({ source, style, className = '' }: any) => <View className="h-48 bg-gray-200 dark:bg-gray-800 w-full mb-2" style={style} />;
