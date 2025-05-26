import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import useLocationsAndSensors from "../hooks/useLocationsAndSensors";
import DeviceList from "../components/devices/DeviceList";
import useCreateDevice from "../hooks/useCreateDevice";
import useUpdateDevice from "../hooks/useUpdateDevice";
import useDeleteDevice from "../hooks/useDeleteDevice";
import AddDeviceModal from "../components/devices/AddDeviceModal";
import EditDeviceModal from "../components/devices/EditDeviceModal";

export default function DevicesPage() {
  const { locations, loading, error } = useLocationsAndSensors();
  const { createDevice, loading: creating, error: createError } = useCreateDevice();
  const { updateDevice, loading: updating, error: updateError } = useUpdateDevice();
  const { deleteDevice, loading: deleting, error: deleteError } = useDeleteDevice();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    serial_number: "",
    provider: "",
    position: "",
    location_id: locations.length > 0 ? locations[0].id : 0,
  });
  const [editData, setEditData] = useState({
    id: 0,
    serial_number: "",
    provider: "",
    position: "",
    location_id: locations.length > 0 ? locations[0].id : 0,
  });

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const openEditModal = (sensor: { id: number; position: string; location_id: number | undefined; }) => {
    setEditData({
      id: sensor.id,
      serial_number: "", // Assuming serial_number is not needed for update
      provider: "", // Assuming provider is not needed for update
      position: sensor.position,
      location_id: sensor.location_id || 0, // Provide a default value if undefined
    });
    setIsEditOpen(true);
  };
  const closeEditModal = () => setIsEditOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "location_id" ? Number(value) : value,
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: name === "location_id" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDevice(formData);
      closeModal();
    } catch (err) {
      console.error("Failed to create device:", err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData = {
        position: editData.position,
        location_id: editData.location_id,
      };
      await updateDevice(editData.id, editData.location_id, updateData);
      closeEditModal();
    } catch (err) {
      console.error("Failed to update device:", err);
    }
  };

  const handleDelete = async (deviceId: number, locationId: number) => {
    try {
      await deleteDevice(deviceId, locationId);
    } catch (err) {
      console.error("Failed to delete device:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (creating) return <div>Creating device...</div>;
  if (createError) return <div>{createError}</div>;
  if (updating) return <div>Updating device...</div>;
  if (updateError) return <div>{updateError}</div>;
  if (deleting) return <div>Deleting device...</div>;
  if (deleteError) return <div>{deleteError}</div>;

  return (
    <div className="flex flex-col border border-gray-300 p-8 rounded-lg h-full gap-y-6 max-w-[50%]">
      <button onClick={openModal} className="self-end bg-blue-500 text-white px-4 py-2 rounded-md mb-4">
        Add Device
      </button>
      {locations.map((location) => (
        <div key={location.id} className="location">
          <h2 className="font-bold mb-2 text-xl pb-2">{location.name}:</h2>
          <DeviceList
            devices={location.sensors}
            onEdit={(device) => openEditModal({
              id: device.id,
              position: device.position,
              location_id: device.location_id || 0, // Ensure location_id is a number
            })}
            onDelete={(device) => handleDelete(device.id, device.location_id || 0)}
          />
        </div>
      ))}

      <AddDeviceModal
        isOpen={isOpen}
        closeModal={closeModal}
        formData={formData}
        locations={locations}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />

      <EditDeviceModal
        isEditOpen={isEditOpen}
        closeEditModal={closeEditModal}
        editData={editData}
        locations={locations}
        handleEditInputChange={handleEditInputChange}
        handleEditSubmit={handleEditSubmit}
      />
    </div>
  );
}
