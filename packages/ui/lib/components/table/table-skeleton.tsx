import { Checkbox } from "../checkbox/checkbox";
import { cn } from "../../utils";

type Props = {
  columns: string[];
  rowCount?: number;
  hideChecks?: boolean;
  className?: string;
};

const TableSkeleton = ({ columns, rowCount = 10, hideChecks = false, className }: Props) => {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-gray-900">
        <thead className="bg-neutral-50/50 dark:bg-neutral-800/30">
          <tr>
            {!hideChecks && (
              <th className="px-6 py-4 text-left">
                <Checkbox
                  id="select-all-skeleton"
                  checked={false}
                  onCheckedChange={() => {}}
                  disabled={true}
                  className="size-4 opacity-50"
                />
              </th>
            )}
            {columns.map((column, index) => column !== "#" && (
              <th
                key={index}
                className="px-6 py-4 text-left text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-neutral-100 dark:divide-neutral-800/50">
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <tr key={`skeleton-row-${rowIndex}`}>
              {!hideChecks && (
                <td className="px-6 py-4">
                  <div className="size-4 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"></div>
                </td>
              )}
              {columns.map((col, cellIndex) => col !== "#" && (
                <td key={cellIndex} className="px-6 py-4">
                  <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse w-full max-w-[120px]"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { TableSkeleton };
