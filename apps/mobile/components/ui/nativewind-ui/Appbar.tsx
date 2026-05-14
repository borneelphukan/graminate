import React from 'react';
import { View, Text as RNText } from 'react-native';
import { IconButton } from './Button';

export const Appbar = ({ children, style, className = '' }: any) => (
  <View className={`h-14 flex-row items-center px-2 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 ${className}`} style={style}>
    {children}
  </View>
);

Appbar.Header = ({ children, style, className = '', ...rest }: any) => (
  <View className={`h-14 flex-row items-center px-2 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 w-full ${className}`} style={style} {...rest}>{children}</View>
);

Appbar.BackAction = ({ onPress, color }: any) => (
  <IconButton icon="arrow-left" iconColor={color} onPress={onPress} />
);

Appbar.Content = ({ title, titleStyle, subtitle, subtitleStyle }: any) => (
  <View className="flex-1 px-2">
    <RNText className="text-lg font-bold text-gray-900 dark:text-white" style={titleStyle}>{title}</RNText>
    {subtitle && <RNText className="text-xs text-gray-500 dark:text-gray-400" style={subtitleStyle}>{subtitle}</RNText>}
  </View>
);

Appbar.Action = ({ icon, onPress, color }: any) => (
  <IconButton icon={icon} iconColor={color} onPress={onPress} />
);
