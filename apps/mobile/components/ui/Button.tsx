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
  const hasText = children !== undefined && children !== null && children !== '';
  let baseClass = "flex-row items-center justify-center rounded-full transition-all ";
  if (hasText) {
    baseClass += "px-4 py-3 ";
  } else {
    baseClass += "p-3 aspect-square ";
  }
  let textClass = "font-semibold text-center text-base ";

  if (mode === 'contained') {
    baseClass += "bg-green-100 ";
    textClass += "text-white ";
  } else if (mode === 'outlined') {
    baseClass += "border border-green-100 bg-transparent ";
    textClass += "text-green-100 ";
  } else if (mode === 'secondary') {
    baseClass += "border border-green-200 bg-white dark:bg-dark-100 ";
    textClass += "text-green-200 ";
  } else if (mode === 'elevated') {
    baseClass += "bg-green-100 shadow-md ";
    textClass += "text-white ";
  } else {
    baseClass += "bg-transparent px-2 py-2 ";
    textClass += "text-green-100 ";
  }

  if (disabled || loading) baseClass += "opacity-60 ";

  const renderIcon = () => {
    const iconColor = rest.textColor || (mode === 'contained' ? 'white' : mode === 'secondary' ? '#04ad79' : '#2b7860');
    const iconSize = 18;
    if (loading) return <RNActivityIndicator size="small" color={iconColor} className={hasText ? "mr-2" : ""} />;
    if (typeof icon === 'string') return <MaterialCommunityIcons name={icon as any} size={iconSize} color={iconColor} style={hasText ? { marginRight: 8 } : undefined} />;
    if (typeof icon === 'function') return <View className={hasText ? "mr-2" : ""}>{icon({ color: iconColor, size: iconSize })}</View>;
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
      {hasText && (
        <RNText 
          className={`${textClass}`} 
          style={[labelStyle, rest.textColor ? { color: rest.textColor } : {}]}
        >
          {children}
        </RNText>
      )}
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
          className={`flex-1 py-2 px-3 justify-center items-center ${isSelected ? 'bg-green-300 dark:bg-green-100' : 'bg-white dark:bg-gray-800'} ${idx > 0 ? 'border-l border-gray-300 dark:border-gray-700' : ''}`}
        >
          <RNText className={`text-xs font-semibold ${isSelected ? 'text-green-100 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
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
      className={`flex-row items-center px-3 py-1.5 rounded-full border ${selected ? 'bg-green-300 border-green-100' : 'bg-white dark:bg-gray-800 border-gray-300'} ${disabled ? 'opacity-50' : ''} ${className}`}
      style={style}
    >
      {renderIcon()}
      <RNText className={`text-xs font-medium ${selected ? 'text-green-100' : 'text-gray-700 dark:text-gray-300'}`}>{children}</RNText>
    </TouchableOpacity>
  );
};
