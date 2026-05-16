import React from 'react';
import { View } from 'react-native';

export const Divider = ({ style, className = '' }: any) => (
  <View className={`h-[1px] w-full bg-gray-400 dark:bg-gray-700 my-1 ${className}`} style={style} />
);
