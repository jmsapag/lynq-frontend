import React from "react";
import { ComputerDesktopIcon } from "@heroicons/react/24/outline";

interface Device {
  id: number;
  name: string;
  type: string;
  status: string;
  lastPing: string;
  ipAddress: string;
}

interface DeviceCardProps {
  device: Device;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ComputerDesktopIcon className="h-8 w-8 text-gray-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{device.name}</h3>
            <p className="text-sm text-gray-500">{device.type}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Status</div>
            <div className="text-sm font-medium text-gray-900">
              <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                {device.status}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm text-gray-500">IP Address</div>
            <div className="text-sm font-medium text-gray-900">
              {device.ipAddress}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm text-gray-500">Last Ping</div>
            <div className="text-sm text-gray-900">{device.lastPing}</div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-4">
        <div className="text-right">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
