import React from 'react';
import { View } from 'react-native';

export const ProgressBar = ({ progress = 0, color = "#2b7860", style, className = '' }: any) => (
  <View className={`h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden my-1 ${className}`} style={style}>
    <View className="h-full" style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%`, backgroundColor: color }} />
  </View>
);
