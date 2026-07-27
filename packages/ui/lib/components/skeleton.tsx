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

type KanbanCardSkeletonProps = {
  className?: string;
};

const KanbanCardSkeleton = ({ className }: KanbanCardSkeletonProps) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-700 p-3 rounded-md shadow relative min-h-[100px] animate-pulse",
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-3/4" />
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        <div className="h-5 w-12 bg-gray-400 dark:bg-gray-600 rounded-full" />
        <div className="h-5 w-16 bg-gray-400 dark:bg-gray-600 rounded-full" />
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="h-5 w-14 bg-gray-400 dark:bg-gray-600 rounded-full" />
        <div className="h-3 w-16 bg-gray-400 dark:bg-gray-600 rounded" />
      </div>
    </div>
  );
};

type ProfileSkeletonProps = {
  showAvatar?: boolean;
  sections?: number;
  className?: string;
  Layout?: React.ComponentType<{ children: React.ReactNode }>;
};

const ProfileSkeleton = ({
  showAvatar = true,
  sections = 2,
  className,
  Layout,
}: ProfileSkeletonProps) => {
  const content = (
    <div className={cn("px-4 sm:px-6 lg:px-8 py-8 animate-pulse", className)}>
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 relative">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center mb-8">
          {showAvatar && (
            <div className="relative mr-0 sm:mr-6 mb-4 sm:mb-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>
          )}

          <div className="flex-grow text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2 sm:mb-0" />
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32" />
            </div>

            <div className="flex items-center justify-center sm:justify-start space-x-3 mt-4">
              <div className="w-12 h-12 bg-gray-400 dark:bg-gray-700 rounded-lg" />
              <div className="w-12 h-12 bg-gray-400 dark:bg-gray-700 rounded-lg" />
              <div className="w-12 h-12 bg-gray-400 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-8">
          {Array.from({ length: sections }).map((_, index) => (
            <div key={index}>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4 pb-1" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-500 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-10 bg-gray-500 dark:bg-gray-700/50 rounded w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end mt-10 pt-6 border-t border-gray-400 dark:border-gray-700 space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="h-10 bg-gray-400 dark:bg-gray-700 rounded w-32" />
          <div className="h-10 bg-gray-400 dark:bg-gray-700 rounded w-32" />
        </div>
      </div>
    </div>
  );

  if (Layout) {
    return <Layout>{content}</Layout>;
  }

  return content;
};

export {
  Skeleton,
  TableSkeleton,
  ButtonSkeleton,
  AvatarSkeleton,
  KanbanCardSkeleton,
  ProfileSkeleton,
};
