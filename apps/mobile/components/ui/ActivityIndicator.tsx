import React from 'react';
import { ActivityIndicator as RNActivityIndicator } from 'react-native';

export const ActivityIndicator = ({ animating = true, color = "#2b7860", size = 'small', style, className = '' }: any) => {
  if (!animating) return null;
  return <RNActivityIndicator size={size} color={color} className={className} style={style} />;
};
