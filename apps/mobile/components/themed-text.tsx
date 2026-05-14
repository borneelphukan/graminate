import { Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className = '',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  let typeClasses = '';
  switch (type) {
    case 'title':
      typeClasses = 'text-4xl font-bold tracking-tight leading-9';
      break;
    case 'defaultSemiBold':
      typeClasses = 'text-base font-semibold leading-6';
      break;
    case 'subtitle':
      typeClasses = 'text-xl font-bold';
      break;
    case 'link':
      typeClasses = 'text-base leading-7 text-[#0a7ea4]';
      break;
    case 'default':
    default:
      typeClasses = 'text-base leading-6';
      break;
  }

  return (
    <Text
      className={`${typeClasses} ${className}`}
      style={[{ color }, style]}
      {...rest}
    />
  );
}
