import React from 'react';
import { View, Text as RNText, TouchableOpacity, Modal as RNModal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const Menu = ({ visible, onDismiss, anchor, children }: any) => {
  return (
    <View>
      {anchor}
      {visible && (
        <RNModal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
          <Pressable className="flex-1" onPress={onDismiss}>
            <View className="absolute top-24 right-4 min-w-[150px] bg-white dark:bg-dark border border-gray-400 dark:border-gray-700 rounded-lg py-1">
              {children}
            </View>
          </Pressable>
        </RNModal>
      )}
    </View>
  );
};

const MenuItem = ({ title, onPress, leadingIcon, titleStyle }: any) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800">
    {leadingIcon && <MaterialCommunityIcons name={leadingIcon as any} size={18} color="#6b7280" style={{ marginRight: 12 }} />}
    <RNText className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1" style={titleStyle}>{title}</RNText>
  </TouchableOpacity>
);
Menu.Item = MenuItem;
