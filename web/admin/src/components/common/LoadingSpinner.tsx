import React from "react";
import { CogIcon } from "@heroicons/react/20/solid";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "加载中..." 
}) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <CogIcon className="animate-spin h-12 w-12 text-blue-500 mx-auto" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};