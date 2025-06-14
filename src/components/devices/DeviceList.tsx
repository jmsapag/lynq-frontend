import React from "react";
import DeviceListItem from "./DeviceListItem";

interface Device {
  id: number;
  position: string;
  serial_number?: string;
  provider?: string;
  location_id?: number;
}

interface DeviceListProps {
  devices: Device[];
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, onEdit, onDelete }) => {
  return (
    <ul className="flex flex-col max-h-40 overflow-y-auto gap-y-1 border-1 rounded-lg border-gray-300">
      {devices.map((device) => (
        <DeviceListItem key={device.id} id={device.id} position={device.position} onEdit={() => onEdit(device)} onDelete={() => onDelete(device)} />
      ))}
    </ul>
  );
};

export default DeviceList; 