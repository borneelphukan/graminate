import React from 'react';
import { Text as RNText } from 'react-native';

export const Text = ({ children, variant = 'bodyMedium', style, className = '', ...rest }: any) => {
  let classes = '';
  switch(variant) {
    case 'displayLarge': classes = 'text-5xl font-bold tracking-tighter text-gray-900 dark:text-gray-100'; break;
    case 'headlineLarge': classes = 'text-3xl font-bold text-gray-900 dark:text-gray-100'; break;
    case 'headlineMedium': classes = 'text-2xl font-bold text-gray-900 dark:text-gray-100'; break;
    case 'headlineSmall': classes = 'text-xl font-bold text-gray-900 dark:text-gray-100'; break;
    case 'titleLarge': classes = 'text-xl font-semibold text-gray-900 dark:text-gray-100'; break;
    case 'titleMedium': classes = 'text-lg font-medium text-gray-800 dark:text-gray-200'; break;
    case 'titleSmall': classes = 'text-base font-medium text-gray-800 dark:text-gray-200'; break;
    case 'bodyLarge': classes = 'text-base text-gray-700 dark:text-gray-300'; break;
    case 'bodyMedium': classes = 'text-sm text-gray-600 dark:text-gray-400'; break;
    case 'bodySmall': classes = 'text-xs text-gray-500 dark:text-gray-500'; break;
    case 'labelLarge': classes = 'text-sm font-medium text-gray-700 dark:text-gray-300'; break;
    case 'labelMedium': classes = 'text-xs font-medium text-gray-500 dark:text-gray-400'; break;
    case 'labelSmall': classes = 'text-[10px] font-medium text-gray-400 dark:text-gray-500'; break;
    default: classes = 'text-sm text-gray-600 dark:text-gray-300';
  }

  return (
    <RNText className={`${classes} ${className}`} style={style} {...rest}>
      {children}
    </RNText>
  );
};

export const HelperText = ({ children, type = 'info', visible = true, className = '', style }: any) => {
  if (!visible || !children) return null;
  const color = type === 'error' ? 'text-red-500' : 'text-gray-500';
  return <RNText className={`text-xs mt-1 pl-1 ${color} ${className}`} style={style}>{children}</RNText>;
};
