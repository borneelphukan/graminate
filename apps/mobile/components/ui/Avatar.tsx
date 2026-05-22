import React from 'react';
import { View, Text as RNText, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const Avatar = {
  Icon: ({ icon, size = 40, color, style, className = "" }: any) => {
    const renderIcon = () => {
      if (typeof icon === 'string') return <MaterialCommunityIcons name={icon as any} size={size * 0.6} color={color} />;
      if (typeof icon === 'function') return icon({ color: color, size: size * 0.6 });
      return icon;
    };
    return (
      <View className={`justify-center items-center rounded-full bg-gray-200 dark:bg-gray-800 ${className}`} style={[{ width: size, height: size }, style]}>
        {renderIcon()}
      </View>
    );
  },
  Image: ({ source, size = 40, style, className = "" }: any) => (
    <Image source={typeof source === 'string' ? { uri: source } : source} className={`rounded-full ${className}`} style={[{ width: size, height: size }, style]} />
  ),
  Text: ({ label, size = 40, labelStyle, style, className = "", labelClassName = "" }: any) => (
    <View className={`justify-center items-center rounded-full bg-gray-200 dark:bg-gray-800 ${className}`} style={[{ width: size, height: size }, style]}>
      <RNText className={`text-dark dark:text-light text-base ${labelClassName}`} style={labelStyle}>{label}</RNText>
    </View>
  )
};
