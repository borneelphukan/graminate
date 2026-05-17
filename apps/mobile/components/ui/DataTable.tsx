import React from 'react';
import { View, Text as RNText, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const DataTable = ({ children, style }: any) => <View className="w-full border border-gray-200 dark:border-gray-800 rounded-lg" style={style}>{children}</View>;

const DataTableHeader = ({ children, style }: any) => <View className="flex-row bg-gray-50 dark:bg-dark-200 border-b border-gray-200 dark:border-gray-800 py-2" style={style}>{children}</View>;
DataTable.Header = DataTableHeader;

const DataTableTitle = ({ children, numeric, style }: any) => (
  <View className={`flex-1 px-2 justify-center ${numeric ? 'items-end' : 'items-start'}`} style={style}>
    <RNText className="text-xs font-bold text-gray-600 dark:text-gray-400">{children}</RNText>
  </View>
);
DataTable.Title = DataTableTitle;

const DataTableRow = ({ children, style, onPress }: any) => {
  const Comp = onPress ? TouchableOpacity : View;
  return (
    <Comp onPress={onPress} className="flex-row border-b border-gray-100 dark:border-gray-800 py-3" style={style}>{children}</Comp>
  );
};
DataTable.Row = DataTableRow;

const DataTableCell = ({ children, numeric, style }: any) => (
  <View className={`flex-1 px-2 justify-center ${numeric ? 'items-end' : 'items-start'}`} style={style}>
    {typeof children === 'string' ? <RNText className="text-sm text-gray-800 dark:text-gray-200">{children}</RNText> : children}
  </View>
);
DataTable.Cell = DataTableCell;

const DataTablePagination = ({ page, numberOfPages, label, onPageChange, showFastPaginationControls, style }: any) => (
  <View className="flex-row items-center justify-end py-2 px-4 border-t border-gray-100 dark:border-gray-800" style={style}>
    <RNText className="text-xs text-gray-500 dark:text-gray-400 mr-4">{label}</RNText>
    <TouchableOpacity onPress={() => onPageChange(Math.max(0, page - 1))} disabled={page === 0} className="p-1 opacity-60">
      <MaterialCommunityIcons name="chevron-left" size={24} color="#49494d" />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => onPageChange(Math.min(numberOfPages - 1, page + 1))} disabled={page >= numberOfPages - 1} className="p-1 opacity-60 ml-2">
      <MaterialCommunityIcons name="chevron-right" size={24} color="#49494d" />
    </TouchableOpacity>
  </View>
);
DataTable.Pagination = DataTablePagination;
