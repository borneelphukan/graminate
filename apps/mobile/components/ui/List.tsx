import React, { useState } from 'react';
import { View, Text as RNText, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';

export const List = {
  Section: ({ children, title, className = '', titleClassName = '' }: any) => (
    <View className={`my-2 ${className}`}>
      {title && (
        <RNText className={`text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-4 mb-2 ${titleClassName}`}>
          {title}
        </RNText>
      )}
      {children}
    </View>
  ),
  Subheader: ({ children, className = '' }: any) => (
    <RNText className={`text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-4 py-2 ${className}`}>
      {children}
    </RNText>
  ),
  Item: ({ title, description, left, right, onPress, className = '', titleClassName = '', descriptionClassName = '' }: any) => (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={!onPress} 
      className={`flex-row items-center justify-between py-3 px-4 bg-white dark:bg-dark-100 ${className}`}
    >
      <View className="flex-row items-center flex-1">
        {left && <View className="mr-4">{left()}</View>}
        <View className="flex-1">
          <RNText className={`text-sm font-medium text-gray-900 dark:text-white ${titleClassName}`}>
            {title}
          </RNText>
          {description && (
            <RNText className={`text-xs text-gray-500 dark:text-gray-400 mt-0.5 ${descriptionClassName}`}>
              {description}
            </RNText>
          )}
        </View>
      </View>
      {right && <View className="ml-3">{right()}</View>}
    </TouchableOpacity>
  ),
  Icon: ({ icon, color, size = 24, className = '' }: any) => {
    const renderIcon = () => {
      if (!icon) return null;
      if (typeof icon === 'string') {
        return <Icon type={icon} size={size} color={color} className={color ? "" : "text-gray-200"} />;
      }
      if (typeof icon === 'function') {
        return icon({ color, size });
      }
      return icon;
    };
    return (
      <View className={`justify-center items-center ${className}`}>
        {renderIcon()}
      </View>
    );
  },
  Accordion: ({ title, left, right, children, expanded, onPress, className = '' }: any) => {
    const [isExpanded, setIsExpanded] = useState(expanded || false);
    const handlePress = () => {
      if (onPress) onPress();
      setIsExpanded(!isExpanded);
    };
    return (
      <View className={className}>
        <TouchableOpacity 
          onPress={handlePress} 
          className="flex-row items-center justify-between py-3 px-4 bg-white dark:bg-dark-100 border-b border-gray-100 dark:border-gray-800"
        >
          <View className="flex-row items-center flex-1">
            {left && <View className="mr-4">{left()}</View>}
            <RNText className="text-sm font-semibold text-gray-900 dark:text-white">{title}</RNText>
          </View>
          <View className="flex-row items-center">
            {right && <View className="mr-2">{right({ isExpanded })}</View>}
            <Icon type={isExpanded ? "chevron-up" : "chevron-down"} size={20} className="text-gray-300" />
          </View>
        </TouchableOpacity>
        {isExpanded && <View className="bg-gray-50 dark:bg-dark-200">{children}</View>}
      </View>
    );
  }
};
