import React from 'react';
import { View, Text as RNText, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const Checkbox: any = ({ status, onPress, disabled, color }: any) => {
  const checked = status === 'checked';
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} className="p-1 justify-center items-center">
      <MaterialCommunityIcons 
        name={checked ? "checkbox-marked" : "checkbox-blank-outline"} 
        size={24} 
        color={disabled ? '#bbbbbc' : (checked ? (color || '#2b7860') : '#49494d')} 
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
