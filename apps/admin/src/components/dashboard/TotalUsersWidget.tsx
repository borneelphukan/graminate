import React from "react";

type Props = {
  count: number;
  isLoading: boolean;
};

const TotalUsersWidget = ({ count, isLoading }: Props) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-400 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-dark dark:text-light uppercase tracking-wider">
          Total Platform Users
        </h3>
      </div>
      
      {isLoading ? (
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
      ) : (
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold font-mono text-dark dark:text-light tracking-tighter">
            {count.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default TotalUsersWidget;
