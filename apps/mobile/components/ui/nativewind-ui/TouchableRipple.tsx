import React from 'react';
import { TouchableOpacity } from 'react-native';

export const TouchableRipple = ({ children, onPress, style, className = '', ...rest }: any) => (
  <TouchableOpacity onPress={onPress} className={className} style={style} activeOpacity={0.7} {...rest}>
    {children}
  </TouchableOpacity>
);
