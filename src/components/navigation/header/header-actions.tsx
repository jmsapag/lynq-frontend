import React from "react";
import { BellIcon } from "@heroicons/react/24/outline";

export const HeaderActions: React.FC = () => {
  return (
    <div className="flex items-center gap-4">
      <button
        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5" />
      </button>
    </div>
  );
};
