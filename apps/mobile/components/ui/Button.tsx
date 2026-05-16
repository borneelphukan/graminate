import React from 'react';
import { View, Text as RNText, TouchableOpacity, ActivityIndicator as RNActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const Button = ({ 
  children, 
  mode = 'contained', 
  onPress, 
  loading, 
  disabled, 
  icon, 
  style, 
  labelStyle,
  className = '',
  contentStyle,
  ...rest 
}: any) => {
  let baseClass = "flex-row items-center justify-center px-4 py-3 rounded-full transition-all ";
  let textClass = "font-semibold text-center text-base ";

  if (mode === 'contained') {
    baseClass += "bg-[#2b7860] ";
    textClass += "text-white ";
  } else if (mode === 'outlined') {
    baseClass += "border border-[#2b7860] bg-transparent ";
    textClass += "text-[#2b7860] ";
  } else if (mode === 'elevated') {
    baseClass += "bg-[#2b7860] shadow-md ";
    textClass += "text-white ";
  } else {
    baseClass += "bg-transparent px-2 py-2 ";
    textClass += "text-[#2b7860] ";
  }

  if (disabled || loading) baseClass += "opacity-60 ";

  const renderIcon = () => {
    const iconColor = mode === 'contained' ? 'white' : '#2b7860';
    const iconSize = 18;
    if (loading) return <RNActivityIndicator size="small" color={iconColor} className="mr-2" />;
    if (typeof icon === 'string') return <MaterialCommunityIcons name={icon as any} size={iconSize} color={iconColor} style={{ marginRight: 8 }} />;
    if (typeof icon === 'function') return <View className="mr-2">{icon({ color: iconColor, size: iconSize })}</View>;
    return null;
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading} 
      className={`${baseClass} ${className}`}
      style={[style, contentStyle]}
      {...rest}
    >
      {renderIcon()}
      <RNText className={`${textClass}`} style={labelStyle}>{children}</RNText>
    </TouchableOpacity>
  );
};

export const IconButton = ({ icon, iconColor, size = 24, onPress, style, className = '' }: any) => {
  const renderContent = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <MaterialCommunityIcons name={icon as any} size={size} color={iconColor || '#49494d'} />;
    }
    if (typeof icon === 'function') {
      return icon({ color: iconColor || '#49494d', size });
    }
    return icon;
  };

  return (
    <TouchableOpacity onPress={onPress} className={`p-2 justify-center items-center ${className}`} style={style}>
      {renderContent()}
    </TouchableOpacity>
  );
};

export const SegmentedButtons = ({ value, onValueChange, buttons, className = '', style }: any) => (
  <View className={`flex-row rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 my-2 ${className}`} style={style}>
    {buttons.map((btn: any, idx: number) => {
      const isSelected = btn.value === value;
      return (
        <TouchableOpacity
          key={btn.value}
          onPress={() => onValueChange(btn.value)}
          className={`flex-1 py-2 px-3 justify-center items-center ${isSelected ? 'bg-[#d8fdf2] dark:bg-[#2b7860]' : 'bg-white dark:bg-[#1e1e1e]'} ${idx > 0 ? 'border-l border-gray-300 dark:border-gray-700' : ''}`}
        >
          <RNText className={`text-xs font-semibold ${isSelected ? 'text-[#2b7860] dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
            {btn.label}
          </RNText>
        </TouchableOpacity>
      );
    })}
  </View>
);

export const Chip = ({ children, onPress, icon, selected, disabled, className = '', style }: any) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <MaterialCommunityIcons name={icon as any} size={16} color={selected ? '#2b7860' : '#6b7280'} style={{ marginRight: 6 }} />;
    }
    if (typeof icon === 'function') {
      return <View style={{ marginRight: 6 }}>{icon({ color: selected ? '#2b7860' : '#6b7280', size: 16 })}</View>;
    }
    return <View style={{ marginRight: 6 }}>{icon}</View>;
  };
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled} 
      className={`flex-row items-center px-3 py-1.5 rounded-full border ${selected ? 'bg-[#d8fdf2] border-[#2b7860]' : 'bg-white dark:bg-[#1e1e1e] border-gray-300'} ${disabled ? 'opacity-50' : ''} ${className}`}
      style={style}
    >
      {renderIcon()}
      <RNText className={`text-xs font-medium ${selected ? 'text-[#2b7860]' : 'text-gray-700 dark:text-gray-300'}`}>{children}</RNText>
    </TouchableOpacity>
  );
};
