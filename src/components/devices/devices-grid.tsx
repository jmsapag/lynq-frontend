import React from "react";
import { DeviceCard } from "./devices-card";

const mockDevices = [
  {
    id: 1,
    name: "Main Server",
    type: "Server",
    status: "Online",
    lastPing: "2 minutes ago",
    ipAddress: "192.168.1.100",
  },
  {
    id: 2,
    name: "Backup Server",
    type: "Server",
    status: "Online",
    lastPing: "5 minutes ago",
    ipAddress: "192.168.1.101",
  },
];

export const DevicesGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mockDevices.map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}
    </div>
  );
};
