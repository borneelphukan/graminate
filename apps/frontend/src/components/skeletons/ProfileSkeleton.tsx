import React from "react";
import PlatformLayout from "@/layout/PlatformLayout";

type ProfileSkeletonProps = {
  showAvatar?: boolean;
  sections?: number;
};

const ProfileSkeleton = ({
  showAvatar = true,
  sections = 2,
}: ProfileSkeletonProps) => {
  return (
    <PlatformLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 relative">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-center mb-8">
            {showAvatar && (
              <div className="relative mr-0 sm:mr-6 mb-4 sm:mb-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>
            )}

            <div className="flex-grow text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2 sm:mb-0"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
              </div>

              <div className="flex items-center justify-center sm:justify-start space-x-3 mt-4">
                <div className="w-12 h-12 bg-gray-400 dark:bg-gray-700 rounded-lg"></div>
                <div className="w-12 h-12 bg-gray-400 dark:bg-gray-700 rounded-lg"></div>
                <div className="w-12 h-12 bg-gray-400 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Form Sections */}
          <div className="space-y-8">
            {Array.from({ length: sections }).map((_, index) => (
              <div key={index}>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4 pb-1"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                       <div className="h-4 bg-gray-500 dark:bg-gray-700 rounded w-1/3"></div>
                       <div className="h-10 bg-gray-500 dark:bg-gray-700/50 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end mt-10 pt-6 border-t border-gray-400 dark:border-gray-700 space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="h-10 bg-gray-400 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-10 bg-gray-400 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default ProfileSkeleton;
