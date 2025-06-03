import React from "react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";

interface MessageAlertProps {
  message: {
    type: "success" | "error";
    text: string;
  } | null;
}

export const MessageAlert: React.FC<MessageAlertProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className={`mb-6 p-4 rounded-md flex items-center gap-3 ${
        message.type === "success"
          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
      }`}
    >
      {message.type === "success" ? (
        <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
      ) : (
        <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
      )}
      {message.text}
    </div>
  );
};