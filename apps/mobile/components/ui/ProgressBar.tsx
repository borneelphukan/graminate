import React from 'react';
import { View } from 'react-native';

export const ProgressBar = ({ progress = 0, color, style, className = '' }: any) => (
  <View className={`h-2 bg-gray-400 dark:bg-gray-700 rounded-full overflow-hidden my-1 ${className}`} style={style}>
    <View className={`h-full ${!color ? 'bg-green-100' : ''}`} style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%`, backgroundColor: color }} />
  </View>
);
