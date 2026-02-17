import React from "react";

const KanbanCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow relative min-h-[100px] animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-3/4"></div>
      </div>
      
      <div className="mt-2 flex flex-wrap gap-1">
        <div className="h-5 w-12 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
        <div className="h-5 w-16 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="h-5 w-14 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
        <div className="h-3 w-16 bg-gray-400 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};

export default KanbanCardSkeleton;
