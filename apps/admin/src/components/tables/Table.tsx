import React, { useState, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import { Button, Icon, Dropdown } from "@graminate/ui";
import Loader from "@/components/ui/Loader";
import SearchBar from "../ui/SearchBar";

type User = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  business_name: string | null;
  type: string;
  sub_type: string;
  plan: string;
  subscription_expires_at: string | null;
};

type Props = {
  users: User[];
  isLoading: boolean;
  admin_id: string;
};

const Table = ({ users, isLoading, admin_id }: Props) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortColumn, setSortColumn] = useState<keyof User | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const columns: { key: keyof User; label: string }[] = [
    { key: "first_name", label: "Owner Name" },
    { key: "email", label: "Contact Email" },
    { key: "business_name", label: "Business Name" },
    { key: "type", label: "Type" },
    { key: "sub_type", label: "Services Opted" },
    { key: "plan", label: "Plan" },
    { key: "subscription_expires_at", label: "Plan Expiry" },
  ];

  const paginationItems = ["25 per page", "50 per page", "100 per page"];

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter((user) =>
      Object.values(user).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [users, searchQuery]);

  const sortedUsers = useMemo(() => {
    if (!sortColumn) return filteredUsers;
    const sorted = [...filteredUsers].sort((a, b) => {
      const aValue =
        sortColumn === "first_name"
          ? `${a.first_name} ${a.last_name}`
          : a[sortColumn];
      const bValue =
        sortColumn === "first_name"
          ? `${b.first_name} ${b.last_name}`
          : b[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
    return sorted;
  }, [filteredUsers, sortColumn, sortOrder]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  const totalRecordCount = filteredUsers.length;

  const handleSort = (columnKey: keyof User) => {
    if (sortColumn === columnKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleRowClick = (userId: string) => {
    router.push(`/platform/${admin_id}/users/${userId}`);
  };

  const handleSelect = (item: string) => {
    const perPageMap: Record<string, number> = {
      "25 per page": 25,
      "50 per page": 50,
      "100 per page": 100,
    };
    setItemsPerPage(perPageMap[item] || 25);
    setCurrentPage(1);
  };

  const exportTableData = (format: "pdf" | "xlsx") => {
    if (users.length === 0) {
      Swal.fire("No Data", "There is no data to export.", "info");
      return;
    }

    const head = [columns.map((c) => c.label)];
    const body = users.map((user) => {
      return columns.map((col) => {
        switch (col.key) {
          case "first_name":
            return `${user.first_name} ${user.last_name}`;
          case "sub_type":
            return String(user.sub_type || "")
              .split(",")
              .filter(Boolean).length;
          case "subscription_expires_at":
            return user.plan === "FREE"
              ? "Unlimited"
              : user.subscription_expires_at
              ? new Date(user.subscription_expires_at).toLocaleDateString()
              : "N/A";
          default:
            const value = user[col.key];
            return value === null || value === undefined
              ? "N/A"
              : String(value);
        }
      });
    });

    if (format === "pdf") {
      const doc = new jsPDF();
      autoTable(doc, {
        head: head,
        body: body,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [52, 73, 94] },
      });
      doc.save("users-list.pdf");
    }

    if (format === "xlsx") {
      const worksheet = XLSX.utils.aoa_to_sheet([
        ...head,
        ...(body as any[][]),
      ]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      XLSX.writeFile(workbook, "users-list.xlsx");
    }
    setShowExportDropdown(false);
  };

  return (
    <div>
      <div className="flex py-4 justify-between items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 rounded-t-lg transition-colors duration-300">
        <div className="flex gap-2">
          <SearchBar
            mode="table"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
          />
        </div>
        <div className="flex flex-row gap-2">
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="secondary"
              label="Download Data"
              disabled={users.length === 0}
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            />
            {showExportDropdown && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-50 transition transform duration-200">
                <button
                  className="w-full text-left text-sm px-4 py-2 hover:bg-gray-500 dark:hover:bg-gray-600 rounded-t-lg"
                  onClick={() => {
                    exportTableData("pdf");
                    setShowExportDropdown(false);
                  }}
                >
                  Export as PDF
                </button>
                <button
                  className="w-full text-left text-sm px-4 py-2 hover:bg-gray-500 dark:hover:bg-gray-600 rounded-b-lg"
                  onClick={() => {
                    exportTableData("xlsx");
                    setShowExportDropdown(false);
                  }}
                >
                  Export as XLSX
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : paginatedUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="p-3 text-left text-xs font-medium text-dark dark:text-light uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-gray-500 dark:hover:bg-gray-700"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="mr-2">{col.label}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                        />
                      </svg>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedUsers.map((user) => (
                <tr
                  key={user.user_id}
                  className="cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleRowClick(user.user_id)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="p-3 whitespace-nowrap text-sm text-dark dark:text-light max-w-[200px] truncate"
                    >
                      {(() => {
                        switch (col.key) {
                          case "first_name":
                            return `${user.first_name} ${user.last_name}`;
                          case "sub_type":
                            return String(user.sub_type || "")
                              .split(",")
                              .filter(Boolean).length;
                          case "subscription_expires_at":
                            return user.plan === "FREE"
                              ? "Unlimited"
                              : user.subscription_expires_at
                              ? new Date(
                                  user.subscription_expires_at
                                ).toLocaleDateString()
                              : "N/A";
                          default:
                            const value = user[col.key];
                            return value === null || value === undefined
                              ? "N/A"
                              : String(value);
                        }
                      })()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-8 text-gray-300">
          <span className="text-2xl block mb-2">🤷‍♂️</span> No Data Available
        </div>
      )}

      {!isLoading && totalRecordCount > 0 && (
        <nav
          className="flex items-center justify-between px-4 py-3 sm:px-6 bg-gray-50 dark:bg-gray-800 rounded-b-lg transition-colors duration-300"
          aria-label="Pagination"
        >
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{" "}
                <span className="font-medium">
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    totalRecordCount
                  )}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalRecordCount)}
                </span>{" "}
                of <span className="font-medium">{totalRecordCount}</span>{" "}
                results
              </p>
            </div>
            <div className="flex items-center">
              <Button
                label="Previous"
                variant="ghost"
                icon={{ left: "chevron_left" }}
                disabled={currentPage === 1}
                onClick={() => {
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
              />
              <p className="mx-3 text-sm dark:text-light text-dark">
                <span className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-sm">
                  {currentPage}
                </span>
              </p>
              <Button
                label="Next"
                variant="ghost"
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
            <div className="relative">
              <Dropdown
                items={paginationItems}
                selectedItem={`${itemsPerPage} per page`}
                onSelect={handleSelect}
              />
            </div>
          </div>
          <div className="flex sm:hidden flex-1 justify-between items-center">
            <Button
              label="Prev"
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => {
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
            />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Page <span className="font-medium">{currentPage}</span>
            </p>
            <Button
              label="Next"
              variant="ghost"
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
    </div>
  );
};

export default Table;
