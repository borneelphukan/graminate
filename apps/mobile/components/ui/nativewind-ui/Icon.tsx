import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const Icon = ({ source, color, size = 24, style }: any) => (
  <MaterialCommunityIcons name={source as any} size={size} color={color || '#49494d'} style={style} />
);

export type IconSource = string;
