import * as React from "react";
import { Checkbox } from "./checkbox";
import { cn } from "../utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-200/60 dark:bg-neutral-800", className)}
      {...props}
    />
  );
}

type TableSkeletonProps = {
  columns: string[];
  rowCount?: number;
  hideChecks?: boolean;
  className?: string;
};

const TableSkeleton = ({
  columns,
  rowCount = 10,
  hideChecks = false,
  className,
}: TableSkeletonProps) => {
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
                  onCheckedChange={() => { }}
                  disabled={true}
                  className="size-4 opacity-50"
                />
              </th>
            )}
            {columns.map(
              (column, index) =>
                column !== "#" && (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest"
                  >
                    {column}
                  </th>
                )
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-neutral-100 dark:divide-neutral-800/50">
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <tr key={`skeleton-row-${rowIndex}`}>
              {!hideChecks && (
                <td className="px-6 py-4">
                  <div className="size-4 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                </td>
              )}
              {columns.map(
                (col, cellIndex) =>
                  col !== "#" && (
                    <td key={cellIndex} className="px-6 py-4">
                      <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse w-full max-w-[120px]" />
                    </td>
                  )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

type ButtonSkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg" | "icon";
  shape?: "default" | "circle";
};

const ButtonSkeleton = ({
  className,
  size = "md",
  shape = "default",
  ...props
}: ButtonSkeletonProps) => {
  const sizeClasses = {
    sm: "h-7 w-16",
    md: "h-9 w-24",
    lg: "h-11 w-32",
    icon: "size-9",
  };

  return (
    <Skeleton
      className={cn(
        sizeClasses[size],
        shape === "circle" ? "rounded-full" : "rounded-md",
        className
      )}
      {...props}
    />
  );
};

type AvatarSkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
};

const AvatarSkeleton = ({
  className,
  size = "md",
  ...props
}: AvatarSkeletonProps) => {
  const sizeClasses = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
  };

  return (
    <Skeleton
      className={cn("rounded-full shrink-0", sizeClasses[size], className)}
      {...props}
    />
  );
};

export { Skeleton, TableSkeleton, ButtonSkeleton, AvatarSkeleton };
