import React from "react";
import { Checkbox } from "@graminate/ui";

type Props = {
  columns: string[];
  rowCount?: number;
  hideChecks?: boolean;
};

const TableSkeleton = ({ columns, rowCount = 10, hideChecks = false }: Props) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {!hideChecks && (
              <th
                className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  id="select-all-skeleton"
                  checked={false}
                  onCheckedChange={() => {}}
                  disabled={true}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </th>
            )}
            {columns.map((column, index) => column !== "#" && (
              <th
                key={index}
                className="p-3 text-left text-xs font-medium text-dark dark:text-light uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-gray-500 dark:hover:bg-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="mr-2">{column}</span>
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
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <tr
              key={`skeleton-row-${rowIndex}`}
              className="transition-colors duration-200"
            >
              {!hideChecks && (
                <td className="p-3 whitespace-nowrap">
                  <div className="h-4 w-4 bg-gray-400 dark:bg-gray-700 rounded animate-pulse"></div>
                </td>
              )}
              {columns.map((col, cellIndex) => col !== "#" && (
                <td key={cellIndex} className="p-3 whitespace-nowrap text-sm">
                  <div className="h-4 bg-gray-400 dark:bg-gray-700 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
