import React, { useState } from 'react';
import { View, Text as RNText, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const List = {
  Section: ({ children, title, titleStyle }: any) => (
    <View className="my-2">
      {title && <RNText className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-4 mb-2" style={titleStyle}>{title}</RNText>}
      {children}
    </View>
  ),
  Subheader: ({ children, style }: any) => (
    <RNText className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-4 py-2" style={style}>{children}</RNText>
  ),
  Item: ({ title, description, left, right, onPress, titleStyle, descriptionStyle, className = '', style }: any) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress} className={`flex-row items-center justify-between py-3 px-4 bg-white dark:bg-[#1e1e1e] ${className}`} style={style}>
      <View className="flex-row items-center flex-1">
        {left && <View className="mr-4">{left({ color: "#49494d" })}</View>}
        <View className="flex-1">
          <RNText className="text-sm font-medium text-gray-900 dark:text-white" style={titleStyle}>{title}</RNText>
          {description && <RNText className="text-xs text-gray-500 dark:text-gray-400 mt-0.5" style={descriptionStyle}>{description}</RNText>}
        </View>
      </View>
      {right && <View className="ml-3">{right({ color: "#bbbbbc" })}</View>}
    </TouchableOpacity>
  ),
  Icon: ({ icon, color, size = 24, style }: any) => {
    const renderIcon = () => {
      if (!icon) return null;
      if (typeof icon === 'string') {
        return <MaterialCommunityIcons name={icon as any} size={size} color={color || "#49494d"} />;
      }
      if (typeof icon === 'function') {
        return icon({ color: color || "#49494d", size });
      }
      return icon;
    };
    return (
      <View className="justify-center items-center" style={style}>
        {renderIcon()}
      </View>
    );
  },
  Accordion: ({ title, left, right, children, expanded, onPress, className = '', style }: any) => {
    const [isExpanded, setIsExpanded] = useState(expanded || false);
    const handlePress = () => {
      if (onPress) onPress();
      setIsExpanded(!isExpanded);
    };
    return (
      <View className={className} style={style}>
        <TouchableOpacity onPress={handlePress} className="flex-row items-center justify-between py-3 px-4 bg-white dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-gray-800">
          <View className="flex-row items-center flex-1">
            {left && <View className="mr-4">{left({ color: "#49494d" })}</View>}
            <RNText className="text-sm font-semibold text-gray-900 dark:text-white">{title}</RNText>
          </View>
          <View className="flex-row items-center">
            {right && <View className="mr-2">{right({ isExpanded })}</View>}
            <MaterialCommunityIcons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9ca3af" />
          </View>
        </TouchableOpacity>
        {isExpanded && <View className="bg-gray-50 dark:bg-[#121212]">{children}</View>}
      </View>
    );
  }
};
