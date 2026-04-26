import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  DataTable,
  Text,
  Searchbar,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";

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
  const theme = useTheme();
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {setSearchQuery && (
        <Searchbar
          placeholder="Search..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      )}

      <ScrollView horizontal>
        <DataTable>
          <DataTable.Header>
            {data.columns.map((column, index) => (
              <DataTable.Title key={index} style={styles.columnTitle}>
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
                  <DataTable.Cell key={cellIndex} style={styles.cell}>
                    {String(cell)}
                  </DataTable.Cell>
                ))}
              </DataTable.Row>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text variant="bodyMedium">No data found</Text>
            </View>
          )}

          <DataTable.Pagination
            page={page}
            numberOfPages={Math.ceil(filteredRows.length / itemsPerPage)}
            onPageChange={(page) => setPage(page)}
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    elevation: 2,
    marginVertical: 8,
    overflow: "hidden",
  },
  searchBar: {
    margin: 8,
  },
  columnTitle: {
    minWidth: 100,
  },
  cell: {
    minWidth: 100,
  },
  centered: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
});

export { MobileTable as Table };
