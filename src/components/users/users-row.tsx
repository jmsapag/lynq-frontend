import React from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface UserRowProps {
  user: User;
}

export const UserRow: React.FC<UserRowProps> = ({ user }) => {
  return (
    <tr>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
              <span className="text-sm font-medium leading-none text-white">
                {user.name.charAt(0)}
              </span>
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="text-sm text-gray-900">{user.email}</div>
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="text-sm text-gray-900">{user.role}</div>
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
          {user.status}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
        <button className="text-gray-400 hover:text-gray-500">
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
};
