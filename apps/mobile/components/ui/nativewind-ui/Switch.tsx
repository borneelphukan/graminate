import React from 'react';
import { Switch as RNSwitch } from 'react-native';

export const Switch = ({ value, onValueChange, style, color }: any) => (
  <RNSwitch 
    value={value} 
    onValueChange={onValueChange} 
    trackColor={{ false: '#e8e8e9', true: color || '#2b7860' }}
    thumbColor={value ? '#ffffff' : '#ffffff'}
    style={style}
  />
);
