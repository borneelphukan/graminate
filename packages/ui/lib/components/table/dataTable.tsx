"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type RowData,
  type Row as TanstackRow,
  type Cell as TanstackCell,
  type CellContext as TanstackCellContext,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { Icon } from "../icon/icon.tsx";
import { Button } from "../button/button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "./table.tsx";
import { TableSkeleton } from "./tableSkeleton.tsx";

import { Fragment, type ComponentType, type ReactNode, useEffect } from "react";
import { cn } from "../../utils.ts";

export type Row<TData extends RowData> = TanstackRow<TData>;
export type Cell<TData extends RowData, TValue = unknown> = TanstackCell<
  TData,
  TValue
>;
export type CellContext<
  TData extends RowData,
  TValue = unknown,
> = TanstackCellContext<TData, TValue>;

export type DataTableColumnDef<
  TData extends RowData,
  TValue = unknown,
> = ColumnDef<TData, TValue> & { width?: number | string };

export type DataTableRef<TData extends RowData> = TanstackTable<TData>;

// ! Feels weird to have SortState here but not FilterState (in the storybook)
// ! Any ideas?
export interface SortState<T extends string> {
  id: T;
  direction: "asc" | "desc";
}

/**
 * Helper function to determine new sort state when a column header is clicked
 * @param columnId - ID of the column that was clicked
 * @param currentSort - Current sort state
 * @returns New sort state or undefined if sorting is to be cleared
 */
const changeSort = <T extends string>(
  columnId: T,
  currentSort?: SortState<T>
) => {
  if (currentSort && currentSort.id === columnId) {
    if (currentSort.direction === "asc") {
      return { id: columnId, direction: "desc" } as SortState<T>;
    } else if (currentSort.direction === "desc") {
      return undefined;
    }
  } else return { id: columnId, direction: "asc" } as SortState<T>;
};

// Base props shared between flat and nested modes
interface DataTableBaseProps<TData, TValue, TProperty extends string> {
  columns: DataTableColumnDef<TData, TValue>[];
  data?: TData[];
  getRowId?: (row: TData, index: number) => string;
  columnVisibility?: Record<string, boolean>;
  sort?: SortState<TProperty>;
  onHeaderSortClick?: (sort: SortState<TProperty> | undefined) => void;
  renderChild?: ComponentType<{ row: TData }>;
  isLoading?: boolean;
  inline?: boolean;
  isFixed?: boolean;
  rowClassName?: (row: TData) => string | undefined;
  showCellBorders?: boolean;
  expandedRowIds?: string[];
  onRowExpandToggle?: (rowId: string) => void;
  tableRef?: React.Ref<TanstackTable<TData>>;
  bulletLines?: boolean;
  pagination?: boolean;
  onPageChange?: (page: number) => void;
  pageIndex?: number;
  pageSize?: number;
  rowCount?: number;
}

/**
 * A generic data table component implementing the tanstack-react-table library
 * @param columns - Columns to display. Use `enableSorting: false` in column definition to disable sorting for a column.
 * @param data - Data to display
 * @param columnVisibility - Column visibility state, add `{columnId: false}` to hide a column
 * @param sort - Current sorting state
 * @param onHeaderSortClick - Callback when a header is clicked for sorting, returns new sort state or undefined if sorting is cleared
 * @param renderChild - Function which returns a nested DataTable for a given row
 * @param isLoading - Shows loading div when true
 * @param inline - Whether the table is displayed as a child table (true) or as a main table (false, default)
 * @param rowClassName - A function that returns a className string for a given row's <tr> element.
 * @param onRowExpandToggle - Callback when a row is expanded or collapsed, returns the row id
 * @param tableRef - Ref to access the underlying TanStack table instance
 * @param bulletLines - Whether to show tree-like bullet lines for nested items (default: false)
 * @returns A data table component
 * @note Data should be pulled from server, with sorting/fetching/filtering/pagination done server-side.
 */
export function DataTable<TData, TValue, TProperty extends string = string>({
  columns,
  data = [],
  getRowId,
  columnVisibility,
  sort,
  onHeaderSortClick,
  renderChild: RenderChild,
  isLoading = false,
  inline = false,
  isFixed = false,
  rowClassName,
  showCellBorders,
  onRowExpandToggle,
  tableRef,
  bulletLines = false,
  pagination = false,
  onPageChange,
  pageIndex = 0,
  pageSize = 10,
  rowCount = 0,
}: DataTableBaseProps<TData, TValue, TProperty>): ReactNode {
  const table = useReactTable({
    data,
    columns,
    getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    ...(RenderChild && {
      getExpandedRowModel: getExpandedRowModel(),
      getRowCanExpand: () => true,
    }),
  });

  useEffect(() => {
    if (tableRef && typeof tableRef === "object" && "current" in tableRef) {
      tableRef.current = table;
    } else if (typeof tableRef === "function") {
      tableRef(table);
    }
  }, [table, tableRef]);

  const { rows } = table.getRowModel();
  const headerGroups = table.getHeaderGroups();

  // Extract visible column widths for skeleton
  const visibleColumnWidths = headerGroups[0]?.headers.map((header) => {
    const colDef = header.column.columnDef;
    const width =
      "width" in colDef &&
      (typeof colDef.width === "number" || typeof colDef.width === "string")
        ? colDef.width
        : undefined;
    return width;
  });

  return (
    <>
      <Table inline={inline} className={isFixed ? "table-fixed" : ""}>
        <TableHeader>
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => {
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    onClick={() =>
                      header.column.columnDef.enableSorting !== false &&
                      onHeaderSortClick?.(
                        changeSort(header.id as TProperty, sort)
                      )
                    }
                    className={cn(
                      "overflow-hidden overflow-ellipsis border-neutral-dark-gray/20",
                      showCellBorders && "border-b",
                      showCellBorders && i !== 0 ? "border-l" : ""
                    )}
                    style={{
                      width:
                        "width" in header.column.columnDef &&
                        (typeof header.column.columnDef.width === "string" ||
                          typeof header.column.columnDef.width === "number")
                          ? header.column.columnDef.width
                          : "auto",
                    }}
                  >
                    <div
                      className={`flex items-center gap-1 
                      ${
                        header.column.columnDef.enableSorting !== false &&
                        onHeaderSortClick &&
                        "cursor-pointer select-none transition-all hover:text-black/90"
                      }
                    `}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.columnDef.enableSorting !== false &&
                        onHeaderSortClick &&
                        (sort?.id === header.column.id ? (
                          sort.direction === "asc" ? (
                            <Icon
                              size="base"
                              type="keyboard_arrow_up"
                              className="w-4 h-4 rounded-sm bg-black/90 text-neutral-white"
                            />
                          ) : (
                            <Icon
                              size="base"
                              type="keyboard_arrow_down"
                              className="w-4 h-4 rounded-sm bg-black/90 text-neutral-white"
                            />
                          )
                        ) : (
                          <Icon
                            size="base"
                            type="expand_all"
                            className="w-4 h-4"
                          />
                        ))}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        {isLoading ? (
          <TableSkeleton
            columnCount={headerGroups[0]?.headers.length ?? columns.length}
            columnWidths={visibleColumnWidths}
            showCellBorders={showCellBorders}
          />
        ) : (
          <TableBody>
            {rows?.length ? (
              rows.map((row, rowI) => {
                const visibleCells = row.getVisibleCells();

                const originalGetToggleExpandedHandler =
                  row.getToggleExpandedHandler;
                const getToggleExpandedHandler = () => {
                  return () => {
                    onRowExpandToggle?.(row.id);
                    originalGetToggleExpandedHandler()();
                  };
                };
                row.getToggleExpandedHandler = getToggleExpandedHandler;

                return (
                  <Fragment key={row.id}>
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        rowClassName?.(row.original),
                        rowClassName?.(row.original)?.includes("no-hover")
                      )}
                    >
                      {visibleCells.map((cell, cellI) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "overflow-hidden overflow-ellipsis border-neutral-dark-gray/20",
                            showCellBorders && cellI !== 0 ? "border-l" : "",
                            showCellBorders && rowI !== rows.length - 1
                              ? "border-b"
                              : "",
                            bulletLines && cellI === 0 && "relative"
                          )}
                          style={{
                            width:
                              "width" in cell.column.columnDef &&
                              (typeof cell.column.columnDef.width ===
                                "string" ||
                                typeof cell.column.columnDef.width === "number")
                                ? cell.column.columnDef.width
                                : "auto",
                          }}
                        >
                          {/* BulletLines */}
                          {bulletLines && inline && cellI === 0 && (
                            <>
                              {/* Vertical Line */}
                              <div
                                className={cn(
                                  "absolute left-4 top-0 w-px",
                                  rowI === rows.length - 1
                                    ? "h-[calc(50%+1px)]"
                                    : "h-full"
                                )}
                                style={{ backgroundColor: "rgb(209 209 209)" }}
                              />
                              {/* Horizontal Line */}
                              <div
                                className="absolute left-4 top-1/2 w-6 h-px"
                                style={{ backgroundColor: "rgb(209 209 209)" }}
                              />
                            </>
                          )}
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {RenderChild && row.getIsExpanded() && (
                      <TableRow key={`${row.id}-child`}>
                        <TableCell colSpan={columns.length} className="p-0">
                          <RenderChild row={row.original} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-6 text-center text-[#B8BCB9]"
                >
                  Keine Daten vorhanden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        )}
        {pagination && (
          <TableFooter className="border-neutral-light-gray">
            <TableRow>
              <TableCell
                colSpan={headerGroups[0]?.headers.length ?? columns.length}
                className="p-0"
              >
                <div className="flex w-full items-center justify-between py-1 px-4">
                  <div className="text-sm text-neutral-dark-gray w-32">
                    {table.getRowModel().rows.length} of {rowCount} rows
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPageChange?.(Math.max(0, pageIndex - 1))}
                      disabled={pageIndex === 0}
                      icon={{ left: "keyboard_arrow_left" }}
                    />
                    <div className="flex h-6 min-w-[3rem] items-center justify-center rounded-md border border-neutral-light-gray px-3 text-sm">
                      {pageIndex + 1}/{Math.ceil(rowCount / pageSize)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        onPageChange?.(
                          Math.min(
                            Math.ceil(rowCount / pageSize) - 1,
                            pageIndex + 1
                          )
                        )
                      }
                      disabled={pageIndex + 1 >= Math.ceil(rowCount / pageSize)}
                      icon={{ left: "keyboard_arrow_right" }}
                    />
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </>
  );
}
