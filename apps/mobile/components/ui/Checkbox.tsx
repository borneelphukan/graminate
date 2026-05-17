import React from 'react';
import { View, Text as RNText, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';

export const Checkbox: any = ({ status, onPress, disabled }: any) => {
  const checked = status === 'checked';
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} className="p-1 justify-center items-center">
      <Icon 
        type={checked ? "checkbox-marked" : "checkbox-blank-outline"} 
        size={24} 
        className={disabled ? 'text-gray-300' : (checked ? 'text-green-100' : 'text-gray-200')} 
      />
    </TouchableOpacity>
  );
};

const CheckboxItem = ({ label, status, onPress, disabled }: any) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} className="flex-row items-center py-2 px-4">
    <View className="flex-1 mr-2">
      <RNText className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{label}</RNText>
    </View>
    <Checkbox status={status} disabled={disabled} />
  </TouchableOpacity>
);
Checkbox.Item = CheckboxItem;

Checkbox.Android = Checkbox;
