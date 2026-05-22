import React from 'react';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { cssInterop } from 'nativewind';

// Interop to allow className to work for basic layout
cssInterop(RNCalendar, {
  className: {
    target: 'style',
  },
});

export type { DateData };

export const Calendar = (props: any) => {
  const { darkMode } = useUserPreferences();

  const theme = {
    backgroundColor: 'transparent',
    calendarBackground: 'transparent',
    textSectionTitleColor: darkMode ? '#bbbbbc' : '#49494d', // gray-300 / gray-200
    selectedDayBackgroundColor: '#2b7860', // green-100
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#2b7860',
    dayTextColor: darkMode ? '#ededed' : '#171717', // foreground
    textDisabledColor: darkMode ? '#49494d' : '#bbbbbc', // gray-200 / gray-300
    arrowColor: '#2b7860',
    monthTextColor: darkMode ? '#ededed' : '#171717',
    ...props.theme,
  };

  return <RNCalendar {...props} theme={theme} />;
};
