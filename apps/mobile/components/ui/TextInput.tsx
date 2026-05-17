import React, { useState } from "react";
import {
  View,
  Text as RNText,
  TouchableOpacity,
  TextInput as RNTextInput,
} from "react-native";
import { Icon } from "./Icon";

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
  className = "",
  style,
  placeholder,
  editable = true,
  mode = "outlined",
  onFocus,
  onBlur,
  ...rest
}: any) => {
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

  // Determine colors based on state
  const labelClass = error ? "text-red-500" : "text-dark dark:text-light";
  const borderClass = error
    ? "border-red-500"
    : isFocused
      ? "border-emerald-600"
      : "border-gray-300 dark:border-gray-700";
  const bgClass = editable
    ? "bg-light dark:bg-gray-800"
    : "bg-light dark:bg-gray-600";
  const textClass = "text-black dark:text-white";

  return (
    <View className={`my-1 w-full ${className}`} style={style}>
      {label && (
        <View className="flex-row items-center mb-1.5">
          <RNText className={`font-medium text-sm ${labelClass}`}>
            {label}
          </RNText>
          {required && <RNText className="text-red-500 ml-1 text-sm">*</RNText>}
        </View>
      )}
      <View
        className={`flex-row items-center w-full px-3 py-2 rounded-lg border ${bgClass} ${borderClass}`}
        style={{
          borderWidth: isFocused || error ? 1.5 : 1,
          opacity: editable ? 1 : 0.7,
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
          className={`flex-1 text-sm placeholder:text-gray-200 dark:placeholder:text-gray-300 ${textClass}`}
          style={{ paddingVertical: 0 }}
          {...rest}
        />
        {isPasswordField && !right && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="ml-2"
            activeOpacity={0.7}
          >
            <Icon
              type={isPasswordVisible ? "eye-off" : "eye"}
              size={20}
              className="text-gray-200 dark:text-gray-300"
            />
          </TouchableOpacity>
        )}
        {right && <View className="ml-2">{right}</View>}
      </View>
      {(hint || (typeof error === "string" && error)) && (
        <View className="flex-col gap-1 pt-1 px-1">
          {hint && (
            <RNText className="text-xs font-normal text-green-200">
              {hint}
            </RNText>
          )}
          {typeof error === "string" && error && (
            <RNText className="text-xs text-red-200">{error}</RNText>
          )}
        </View>
      )}
    </View>
  );
};

const TextInputIcon = ({ icon, onPress, color, className = "" }: any) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === "string")
      return (
        <Icon
          type={icon}
          size={20}
          color={color}
          className={
            !color ? `text-gray-200 dark:text-gray-300 ${className}` : className
          }
        />
      );
    if (typeof icon === "function") return icon({ color, className, size: 20 });
    return icon;
  };
  return <TouchableOpacity onPress={onPress}>{renderIcon()}</TouchableOpacity>;
};
TextInput.Icon = TextInputIcon;

export const Searchbar = ({
  value,
  onChangeText,
  placeholder,
  style,
  className = "",
  ...rest
}: any) => {
  return (
    <View
      className={`flex-row items-center border rounded-full px-4 py-2 my-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}
      style={style}
    >
      <Icon
        type="magnify"
        size={20}
        className="text-gray-200 dark:text-gray-300 mr-2"
      />
      <RNTextInput
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        className="flex-1 text-sm text-black dark:text-white placeholder:text-gray-200 dark:placeholder:text-gray-300"
        style={{ color: undefined }}
        {...rest}
      />
    </View>
  );
};
