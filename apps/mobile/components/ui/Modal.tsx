import React from 'react';
import { View, Text as RNText, Modal as RNModal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const Portal = ({ children }: any) => <>{children}</>;

export const Modal = ({ visible, onDismiss, children, contentContainerStyle, className = '', containerClassName = 'justify-center items-center bg-black/50' }: any) => {
  const hasWidth = className.includes('w-') || (contentContainerStyle && contentContainerStyle.width);
  const hasPadding = className.includes('p-') || (contentContainerStyle && contentContainerStyle.padding);
  const hasRounding = className.includes('rounded-') || (contentContainerStyle && contentContainerStyle.borderRadius);

  return (
    <RNModal visible={visible} onRequestClose={onDismiss} transparent={true} animationType="fade">
      <View className={`flex-1 ${containerClassName}`}>
        <Pressable className="absolute inset-0" onPress={onDismiss} />
        <View 
          className={`bg-white dark:bg-[#1e1e1e] shadow-xl ${!hasWidth ? 'w-[90%]' : ''} ${!hasPadding ? 'p-6' : ''} ${!hasRounding ? 'rounded-2xl' : ''} ${className}`} 
          style={contentContainerStyle}
        >
          {children}
        </View>
      </View>
    </RNModal>
  );
};

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
