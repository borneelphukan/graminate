import React, { useState, useMemo, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Popup } from "../popup/popup";

import { Dropdown } from "../dropdown/dropdown";
import { Icon } from "../icon/icon";
import { Checkbox } from "../checkbox/checkbox";
import { Button } from "../button/button";
import { SearchBar } from "../searchbar/searchbar";
import { TableSkeleton } from "./table-skeleton";

export type RowType = unknown[];

type TableData = {
  columns: string[];
  rows: RowType[];
};

type Props = {
  onRowClick?: (row: RowType) => void;
  data: TableData;
  filteredRows: RowType[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (n: number) => void;
  paginationItems: string[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalRecordCount: number;
  view?: string;
  exportEnabled?: boolean;
  loading?: boolean;
  hideChecks?: boolean;
  download?: boolean;
  onDeleteRows?: (selectedRows: RowType[]) => Promise<void>;
  onAction?: (row: RowType, action: string) => void;
};

const Table = ({
  onRowClick,
  data,
  filteredRows,
  currentPage,
  setCurrentPage,
  setItemsPerPage,
  paginationItems,
  searchQuery,
  setSearchQuery,
  totalRecordCount,
  view = "",
  loading,
  hideChecks = false,
  download = true,
  onDeleteRows,
  onAction,
}: Props) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<boolean[]>([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [itemsPerPage, setItemsPerPageState] = useState(10);
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    variant: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    text: "",
    variant: "info",
  });
  const [deleteConfirmPopup, setDeleteConfirmPopup] = useState<{
    isOpen: boolean;
    selectedRowsData: RowType[];
  }>({
    isOpen: false,
    selectedRowsData: [],
  });

  const effectiveLoading = loading;

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredRows.slice(start, end);
  }, [filteredRows, currentPage, itemsPerPage]);

  useEffect(() => {
    setSelectedRows(new Array(paginatedRows.length).fill(false));
    setSelectAll(false);
  }, [paginatedRows]);

  const selectedRowCount = selectedRows.filter(Boolean).length;

  const sortedAndPaginatedRows = useMemo(() => {
    const rows = [...paginatedRows];
    if (sortColumn !== null) {
      rows.sort((a: any, b: any) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        if (typeof valueA === "number" && typeof valueB === "number") {
          return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
        }
        return 0;
      });
    }
    return rows;
  }, [paginatedRows, sortColumn, sortOrder]);

  const getExportRows = () => {
    const selected = selectedRows
      .map((isSelected, idx) =>
        isSelected ? sortedAndPaginatedRows[idx] : null
      )
      .filter((row): row is RowType => row !== null);

    return selected.length > 0 ? selected : sortedAndPaginatedRows;
  };

  const exportTableData = (format: "pdf" | "xlsx") => {
    const exportRows = getExportRows();

    if (exportRows.length === 0) {
      setPopup({
        isOpen: true,
        title: "No Data",
        text: "There is no data to export.",
        variant: "info",
      });
      return;
    }

    if (format === "pdf") {
      const doc = new jsPDF();
      const filteredColumns = data.columns.filter((col) => col !== "#");
      const pdfBodyData = exportRows.map((row) =>
        (row as any[]).filter((_, idx) => data.columns[idx] !== "#").map((cell) => {
          if (cell === null || cell === undefined) return "";
          return String(cell);
        })
      );
      autoTable(doc, {
        head: [filteredColumns],
        body: pdfBodyData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [52, 73, 94] },
      });
      doc.save(`${view}.pdf`);
    }

    if (format === "xlsx") {
      const filteredColumns = data.columns.filter((col) => col !== "#");
      const filteredExportRows = exportRows.map((row) =>
        (row as any[]).filter((_, idx) => data.columns[idx] !== "#")
      );
      const worksheet = XLSX.utils.aoa_to_sheet([filteredColumns, ...filteredExportRows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${view}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedRows(new Array(paginatedRows.length).fill(checked));
  };

  const handleRowCheckboxChange = (
    rowIndex: number,
    checked: boolean
  ) => {
    setSelectedRows((prev) => {
      const newSelected = [...prev];
      newSelected[rowIndex] = checked;
      setSelectAll(newSelected.every(Boolean));
      return newSelected;
    });
  };

  const handleDeleteSelected = async () => {
    if (!onDeleteRows) return;
    
    const selectedRowsData = sortedAndPaginatedRows.filter((_, idx) => selectedRows[idx]);
    
    if (selectedRowsData.length === 0) {
      setPopup({
        isOpen: true,
        title: "No Selection",
        text: "Please select at least one row to delete.",
        variant: "info",
      });
      return;
    }

    setDeleteConfirmPopup({
      isOpen: true,
      selectedRowsData,
    });
  };

  const toggleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnIndex);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleSelect = (item: string) => {
    const itemsPerPageMap: Record<string, number> = {
      "10 per page": 10,
      "25 per page": 25,
      "50 per page": 50,
      "100 per page": 100,
    };
    const newItemsPerPage = itemsPerPageMap[item] || 10;
    setItemsPerPageState(newItemsPerPage);
    setItemsPerPage(newItemsPerPage);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-visible transition-all">
      <div className="px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="w-full max-w-[280px]">
            <SearchBar
              mode="table"
              placeholder="Search data..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>
          {selectedRowCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 animate-in fade-in slide-in-from-left-2 duration-300 flex-shrink-0">
              <span className="text-primary-700 dark:text-primary-300 whitespace-nowrap leading-none">
                {selectedRowCount} Selected
              </span>
              <div className="w-px h-3 bg-primary-200 dark:bg-primary-800 flex-shrink-0" />
              <button
                className="text-red-200 dark:text-red-400 hover:text-red-300 hover:cursor-pointer dark:hover:text-red-300 transition-colors whitespace-nowrap leading-none"
                onClick={(event) => {
                  event.preventDefault();
                  handleDeleteSelected();
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
          {download && (
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="secondary"
                size="sm"
                label="Download"
                icon={{ right: "download" }}
                disabled={filteredRows.length === 0}
                onClick={() => setShowExportDropdown(!showExportDropdown)}
              />
              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-700 border dark:border-gray-200 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                  <button
                    className="w-full text-left text-sm px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 flex items-center gap-2 font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
                    onClick={() => {
                      exportTableData("pdf");
                      setShowExportDropdown(false);
                    }}
                  >
                    <Icon type="picture_as_pdf" size={18} />
                    Export as PDF
                  </button>
                  <button
                    className="w-full text-left text-sm px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 flex items-center gap-2 font-medium text-neutral-700 dark:text-neutral-300 border-t border-gray-400 dark:border-gray-600 transition-colors"
                    onClick={() => {
                      exportTableData("xlsx");
                      setShowExportDropdown(false);
                    }}
                  >
                    <Icon type="table_chart" size={18} />
                    Export as Excel
                  </button>
                </div>
              )}
            </div>
          )}
      </div>

      {effectiveLoading ? (
        <TableSkeleton
          columns={data.columns}
          rowCount={itemsPerPage}
          hideChecks={hideChecks}
        />
      ) : sortedAndPaginatedRows.length > 0 ? (
        <div className="overflow-x-auto relative z-10 custom-scrollbar">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            <thead className="text-xs text-gray-700 uppercase bg-gray-500 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {!hideChecks && (
                  <th
                    className="px-6 py-3 text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      id="select-all-checkbox"
                      checked={selectAll && paginatedRows.length > 0}
                      onCheckedChange={handleSelectAllChange}
                      disabled={paginatedRows.length === 0}
                      className="size-4"
                      aria-label={selectAll ? "Deselect all" : "Select all"}
                    />
                  </th>
                )}
                {data.columns.map((column, index) => column !== "#" && (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-bold text-neutral-500 dark:text-neutral-400 cursor-pointer group transition-colors duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => toggleSort(index)}
                  >
                    <div className="flex items-center gap-1.5 justify-start">
                      <span>{column}</span>
                      <Icon 
                        type={sortColumn === index ? (sortOrder === "asc" ? "arrow_drop_up" : "arrow_drop_down") : "unfold_more"} 
                        size={14} 
                        className={`transition-opacity duration-200 ${sortColumn === index ? "opacity-100 text-primary-500" : "opacity-0 group-hover:opacity-40"}`}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {sortedAndPaginatedRows.map((row, rowIndex) => (
                <tr
                  key={`row-${rowIndex}-${(row as any[])[0]}`}
                  className={`group cursor-pointer transition-all duration-200 ${
                    selectedRows[rowIndex]
                      ? "bg-primary-50/40 dark:bg-primary-900/10"
                      : "hover:bg-gray-50 dark:hover:bg-gray-600"
                  } border-b border-neutral-200 dark:border-gray-700 relative`}
                  style={{ zIndex: sortedAndPaginatedRows.length - rowIndex }}
                  onClick={(e) => {
                    if (
                      (e.target as HTMLElement).tagName !== "INPUT" &&
                      (e.target as HTMLElement).closest("button") === null
                    ) {
                      onRowClick?.(row);
                    }
                  }}
                >
                  {!hideChecks && (
                    <td
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        id={`row-checkbox-${rowIndex}`}
                        checked={selectedRows[rowIndex] || false}
                        onCheckedChange={(checked: boolean) => handleRowCheckboxChange(rowIndex, !!checked)}
                        className="size-4 transition-transform group-hover:scale-105"
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}

                  {(row as any[]).map((cell, cellIndex) => data.columns[cellIndex] !== "#" && (
                    <td
                      key={cellIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-dark dark:text-light max-w-[240px] ${
                        view === "subscriptions" && data.columns[cellIndex] === "Action" ? "" : "truncate"
                      }`}
                      title={
                        Array.isArray(cell)
                          ? cell.join(", ")
                          : typeof cell === "string" || typeof cell === "number"
                          ? String(cell)
                          : undefined
                      }
                    >
                      {view === "inventory" &&
                      data.columns[cellIndex] === "Status" ? (
                        <div className="flex gap-[2px] text-sm">
                          {(() => {
                            const quantityIndex =
                              data.columns.indexOf("Quantity");
                            if (quantityIndex === -1) return "?";
                            const quantityValue = (row as any[])[quantityIndex];
                            if (typeof quantityValue !== "number")
                              return (
                                <Icon
                                  type={"circle"}
                                  className="text-red-200"
                                />
                              );
                            const quantity = quantityValue;
                            const max = Math.max(
                              0,
                              ...filteredRows
                                .map((r) => (r as any[])[quantityIndex])
                                .filter(
                                  (q): q is number => typeof q === "number"
                                )
                            );
                            const ratio = max > 0 ? quantity / max : 0;
                            let count = 0;
                            let color = "";
                            if (quantity <= 0 || (max > 0 && ratio < 0.25)) {
                              count = 1;
                              color = "text-red-200";
                            } else if (max > 0 && ratio < 0.5) {
                              count = 2;
                              color = "text-orange-400";
                            } else if (max > 0 && ratio < 0.75) {
                              count = 3;
                              color = "text-yellow-200";
                            } else {
                              count = 4;
                              color = "text-green-200";
                            }
                            return Array.from({ length: count }).map((_, i) => (
                              <Icon
                                key={i}
                                type={"circle"}
                                className={color}
                              />
                            ));
                          })()}
                        </div>
                      ) : view === "subscriptions" && data.columns[cellIndex] === "Action" ? (
                        <div className="w-44" onClick={(e) => e.stopPropagation()}>
                          {(() => {
                            const currentPlan = (row as any[])[data.columns.indexOf("Plan")];
                            let items: string[] = [];
                            
                            if (currentPlan === "FREE") {
                              items = ["Allow Basic Access", "Allow Pro Access"];
                            } else if (currentPlan === "BASIC") {
                              items = ["Allow Pro Access", "Revoke Paid Access"];
                            } else if (currentPlan === "PRO") {
                              items = ["Allow Basic Access", "Revoke Paid Access"];
                            }

                            return items.length > 0 ? (
                              <Dropdown
                                items={items}
                                selectedItem="Change Plan"
                                onSelect={(action) => onAction?.(row, action)}
                                variant="small"
                                width="full"
                              />
                            ) : null;
                          })()}
                        </div>
                      ) : view === "users" && data.columns[cellIndex] === "Actions" ? (
                        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                          <Button
                            label="Delete"
                            variant="destructive"
                            size="sm"
                            onClick={() => onAction?.(row, "DELETE")}
                          />
                        </div>
                      ) : (
                        React.isValidElement(cell) ? (cell as React.ReactNode) : String(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="size-16 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-center mb-4 border border-neutral-100 dark:border-neutral-800">
            <Icon type="search_off" size={32} className="text-neutral-400 dark:text-neutral-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">No results found</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
            We couldn't find what you're looking for. Try adjusting your search or filters.
          </p>
        </div>
      )}

      {!effectiveLoading && totalRecordCount > 0 && (
        <nav
          className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-neutral-50/50 dark:bg-neutral-800/30 gap-4 relative z-20 rounded-b-xl"
          aria-label="Pagination"
        >
          <div className="flex items-center gap-6 order-2 sm:order-1">
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">
              Showing <span className="text-neutral-900 dark:text-neutral-100">{Math.min((currentPage - 1) * itemsPerPage + 1, totalRecordCount)}</span> to <span className="text-neutral-900 dark:text-neutral-100">{Math.min(currentPage * itemsPerPage, totalRecordCount)}</span> of <span className="text-neutral-900 dark:text-neutral-100">{totalRecordCount}</span>
            </p>
            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />
            <div className="relative z-10">
              <Dropdown
                direction="up"
                items={paginationItems}
                selectedItem={`${itemsPerPage} per page`}
                onSelect={handleSelect}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              label="Prev"
              variant="ghost"
              size="sm"
              icon={{ left: "chevron_left" }}
              disabled={currentPage === 1}
              onClick={() => {
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
            />
            <div className="flex items-center rounded-lg px-3 py-1.5 shadow-sm">
              <span className="text-[13px] text-primary-600 dark:text-primary-400">{currentPage}</span>
              <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">/</span>
              <span className="text-[13px] text-neutral-500 dark:text-neutral-500">{Math.ceil(totalRecordCount / itemsPerPage) || 1}</span>
            </div>
            <Button
              label="Next"
              variant="ghost"
              size="sm"
              icon={{ right: "chevron_right" }}
              disabled={
                currentPage === Math.ceil(totalRecordCount / itemsPerPage) ||
                totalRecordCount === 0
              }
              onClick={() => {
                if (currentPage < Math.ceil(totalRecordCount / itemsPerPage))
                  setCurrentPage(currentPage + 1);
              }}
            />
          </div>
        </nav>
      )}
      <Popup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev: any) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        text={popup.text}
        variant={popup.variant}
      />
      <Popup
        isOpen={deleteConfirmPopup.isOpen}
        onClose={() => setDeleteConfirmPopup({ isOpen: false, selectedRowsData: [] })}
        title="Confirm Deletion"
        text={`Are you sure you want to delete ${deleteConfirmPopup.selectedRowsData.length} selected row${deleteConfirmPopup.selectedRowsData.length > 1 ? "s" : ""}? This action cannot be undone.`}
        confirmButtonText="OK"
        cancelButtonText="Cancel"
        showCancelButton={true}
        onConfirm={async () => {
          await onDeleteRows?.(deleteConfirmPopup.selectedRowsData);
          setDeleteConfirmPopup({ isOpen: false, selectedRowsData: [] });
        }}
        variant="error"
      />
    </div>
  );
};

export { Table };
export type { TableData };
