import React from 'react';
import { View, Text as RNText, Modal as RNModal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const Portal = ({ children }: any) => <>{children}</>;

export const Modal = ({ visible, onDismiss, children, contentContainerStyle, className = '' }: any) => (
  <RNModal visible={visible} onRequestClose={onDismiss} transparent={true} animationType="fade">
    <View className="flex-1 justify-center items-center bg-black/50">
      <Pressable className="absolute inset-0" onPress={onDismiss} />
      <View className={`bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl w-[90%] p-6 max-h-[80%] ${className}`} style={contentContainerStyle}>
        {children}
      </View>
    </View>
  </RNModal>
);

export const Dialog = ({ visible, onDismiss, children, style }: any) => (
  <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={style}>
    {children}
  </Modal>
);

Dialog.Title = ({ children, style }: any) => (
  <RNText className="text-xl font-bold text-gray-900 dark:text-white mb-3" style={style}>{children}</RNText>
);

Dialog.Content = ({ children, style }: any) => (
  <View className="py-1" style={style}>{children}</View>
);

Dialog.Actions = ({ children, style }: any) => (
  <View className="flex-row justify-end gap-2 mt-4" style={style}>{children}</View>
);

Dialog.Icon = ({ icon, size = 36, color, style }: any) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') return <MaterialCommunityIcons name={icon as any} size={size} color={color || '#49494d'} />;
    if (typeof icon === 'function') return icon({ color: color || '#49494d', size });
    return icon;
  };
  return (
    <View className="items-center justify-center mb-3 w-full" style={style}>
      {renderIcon()}
    </View>
  );
};
