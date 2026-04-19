import { Icon } from "@graminate/ui";
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
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Icon type="group" className="size-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
      ) : (
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold font-mono text-dark dark:text-light tracking-tighter">
            {count.toLocaleString()}
          </p>
          <span className="text-xs text-green-600 dark:text-green-400 font-bold border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10 px-1.5 py-0.5 rounded">
            Live
          </span>
        </div>
      )}
      
      <p className="text-xs text-dark dark:text-light mt-4">
        Total registered accounts across all services
      </p>
    </div>
  );
};

export default TotalUsersWidget;
