import React, { useState } from 'react';
import { View, Text as RNText, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';

export const TextInput = ({ 
  label, 
  value, 
  onChangeText, 
  error, 
  required,
  hint,
  secureTextEntry,
  right,
  left,
  className = '',
  style,
  placeholder,
  editable = true,
  mode = 'outlined',
  onFocus,
  onBlur,
  ...rest 
}: any) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const isPasswordField = secureTextEntry;
  const actualSecureTextEntry = isPasswordField && !isPasswordVisible;

  const labelColor = error ? colors.error : colors.onSurfaceVariant;
  const borderColor = error 
    ? colors.error 
    : isFocused 
      ? colors.primary 
      : colors.outline;
  const bgColor = editable ? colors.background : colors.surfaceDisabled;
  const textColor = colors.onSurface;
  const placeholderColor = colors.onSurfaceVariant;

  return (
    <View className={`my-1 w-full ${className}`} style={style}>
      {label && (
        <View className="flex-row items-center mb-1.5">
          <RNText 
            className="font-medium text-sm" 
            style={{ color: labelColor }}
          >
            {label}
          </RNText>
          {required && (
            <RNText className="text-red-500 ml-1 text-sm">*</RNText>
          )}
        </View>
      )}
      <View 
        className="flex-row items-center w-full px-3 py-2 rounded-lg border"
        style={{ 
          backgroundColor: bgColor, 
          borderColor: borderColor,
          borderWidth: isFocused || error ? 1.5 : 1,
          opacity: editable ? 1 : 0.7
        }}
      >
        {left && <View className="mr-2">{left}</View>}
        <RNTextInput 
          value={value}
          placeholder={placeholder}
          onChangeText={onChangeText}
          secureTextEntry={actualSecureTextEntry}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="flex-1 text-sm"
          style={{ color: textColor, paddingVertical: 0 }}
          placeholderTextColor={placeholderColor}
          {...rest}
        />
        {isPasswordField && !right && (
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)} 
            className="ml-2"
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name={isPasswordVisible ? "eye-off" : "eye"} 
              size={20} 
              color={colors.onSurfaceVariant} 
            />
          </TouchableOpacity>
        )}
        {right && <View className="ml-2">{right}</View>}
      </View>
      {(hint || (typeof error === 'string' && error)) && (
        <View className="flex-col gap-1 pt-1 px-1">
          {hint && (
            <RNText className="text-xs font-normal" style={{ color: colors.secondary }}>
              {hint}
            </RNText>
          )}
          {typeof error === 'string' && error && (
            <RNText className="text-xs text-red-500">
              {error}
            </RNText>
          )}
        </View>
      )}
    </View>
  );
};

TextInput.Icon = ({ icon, onPress, color }: any) => {
  const { colors } = useTheme();
  const renderIcon = () => {
    if (!icon) return null;
    const iconColor = color || colors.onSurfaceVariant;
    if (typeof icon === 'string') return <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />;
    if (typeof icon === 'function') return icon({ color: iconColor, size: 20 });
    return icon;
  };
  return (
    <TouchableOpacity onPress={onPress}>
      {renderIcon()}
    </TouchableOpacity>
  );
};

export const Searchbar = ({ value, onChangeText, placeholder, style, className = '', ...rest }: any) => {
  const { colors } = useTheme();
  return (
    <View 
      className={`flex-row items-center border rounded-full px-4 py-2 my-2 ${className}`} 
      style={[{ 
        backgroundColor: colors.surface, 
        borderColor: colors.outlineVariant 
      }, style]}
    >
      <MaterialCommunityIcons 
        name="magnify" 
        size={20} 
        color={colors.onSurfaceVariant} 
        style={{ marginRight: 8 }} 
      />
      <RNTextInput
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        className="flex-1 text-sm"
        style={{ color: colors.onSurface }}
        placeholderTextColor={colors.onSurfaceVariant}
        {...rest}
      />
    </View>
  );
};
