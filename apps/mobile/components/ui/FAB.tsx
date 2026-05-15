import React from 'react';
import { Text as RNText, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const FAB = ({ icon, label, onPress, style, className = '', color, small }: any) => {
  const size = small ? 20 : 24;
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') return <MaterialCommunityIcons name={icon as any} size={size} color={color || "white"} />;
    if (typeof icon === 'function') return icon({ color: color || "white", size });
    return icon;
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      className={`absolute right-6 bottom-6 rounded-full bg-[#2b7860] items-center justify-center shadow-lg flex-row ${label ? 'px-5 py-3' : small ? 'w-10 h-10' : 'w-14 h-14'} ${className}`}
      style={style}
    >
      {renderIcon()}
      {label && <RNText className="ml-2 font-semibold text-sm text-white" style={{ color: color || 'white' }}>{label}</RNText>}
    </TouchableOpacity>
  );
};
