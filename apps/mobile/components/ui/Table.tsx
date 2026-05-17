import React, { useState, useMemo } from "react";
import { View, ScrollView } from "react-native";
import {
  DataTable,
  Text,
  Searchbar,
  ActivityIndicator,
} from "@/components/ui";

type RowType = any[];

type TableData = {
  columns: string[];
  rows: RowType[];
};

type Props = {
  onRowClick?: (row: RowType) => void;
  data: TableData;
  loading?: boolean;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  itemsPerPage?: number;
};

const MobileTable = ({
  onRowClick,
  data,
  loading = false,
  searchQuery = "",
  setSearchQuery,
  itemsPerPage: initialItemsPerPage = 10,
}: Props) => {
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return data.rows;
    return data.rows.filter((row) =>
      row.some((cell) =>
        String(cell).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data.rows, searchQuery]);

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredRows.length);

  const displayedRows = useMemo(() => {
    return filteredRows.slice(from, to);
  }, [filteredRows, from, to]);

  if (loading) {
    return (
      <View className="p-5 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="rounded-lg elevation-sm my-2 overflow-hidden bg-white dark:bg-dark-surface">
      {setSearchQuery && (
        <Searchbar
          placeholder="Search..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          className="m-2 bg-transparent"
        />
      )}

      <ScrollView horizontal>
        <DataTable>
          <DataTable.Header>
            {data.columns.map((column, index) => (
              <DataTable.Title key={index} className="min-w-[100px]">
                {column}
              </DataTable.Title>
            ))}
          </DataTable.Header>

          {displayedRows.length > 0 ? (
            displayedRows.map((row, rowIndex) => (
              <DataTable.Row
                key={rowIndex}
                onPress={() => onRowClick?.(row)}
              >
                {row.map((cell, cellIndex) => (
                  <DataTable.Cell key={cellIndex} className="min-w-[100px]">
                    <Text className="text-dark dark:text-light">{String(cell)}</Text>
                  </DataTable.Cell>
                ))}
              </DataTable.Row>
            ))
          ) : (
            <View className="p-5 items-center">
              <Text>No data found</Text>
            </View>
          )}

          <DataTable.Pagination
            page={page}
            numberOfPages={Math.ceil(filteredRows.length / itemsPerPage)}
            onPageChange={(page: number) => setPage(page)}
            label={`${from + 1}-${to} of ${filteredRows.length}`}
            numberOfItemsPerPageList={[10, 25, 50]}
            numberOfItemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            showFastPaginationControls
            selectPageDropdownLabel={"Rows per page"}
          />
        </DataTable>
      </ScrollView>
    </View>
  );
};

export { MobileTable as Table };
