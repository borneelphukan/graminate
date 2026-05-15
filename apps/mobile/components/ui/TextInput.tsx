import React from 'react';
import { View, Text as RNText, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const TextInput = ({ 
  label, 
  value, 
  onChangeText, 
  error, 
  secureTextEntry,
  right,
  left,
  className = '',
  style,
  placeholder,
  editable = true,
  mode = 'outlined',
  ...rest 
}: any) => {
  return (
    <View className={`my-1 w-full ${className}`} style={style}>
      {label && <RNText className={`mb-1.5 text-xs font-medium ${error ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>{label}</RNText>}
      <View className={`flex-row items-center w-full px-3 py-2.5 rounded-lg bg-white dark:bg-[#121212] border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} focus:border-[#2b7860]`}>
        {left && <View className="mr-2">{left}</View>}
        <RNTextInput 
          value={value}
          placeholder={placeholder}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          editable={editable}
          className="flex-1 text-sm text-gray-900 dark:text-white"
          placeholderTextColor="#9ca3af"
          {...rest}
        />
        {right && <View className="ml-2">{right}</View>}
      </View>
    </View>
  );
};

TextInput.Icon = ({ icon, onPress, color }: any) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') return <MaterialCommunityIcons name={icon as any} size={20} color={color || "#49494d"} />;
    if (typeof icon === 'function') return icon({ color: color || "#49494d", size: 20 });
    return icon;
  };
  return (
    <TouchableOpacity onPress={onPress}>
      {renderIcon()}
    </TouchableOpacity>
  );
};

export const Searchbar = ({ value, onChangeText, placeholder, style, className = '', ...rest }: any) => (
  <View className={`flex-row items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 my-2 ${className}`} style={style}>
    <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" style={{ marginRight: 8 }} />
    <RNTextInput
      value={value}
      placeholder={placeholder}
      onChangeText={onChangeText}
      className="flex-1 text-sm text-gray-900 dark:text-white"
      placeholderTextColor="#9ca3af"
      {...rest}
    />
  </View>
);
