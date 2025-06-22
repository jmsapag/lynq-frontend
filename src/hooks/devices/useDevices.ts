import { useEffect, useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface Device {
  id: number;
  serial_number: string;
  provider: string;
  position: string;
  created_at: string;
  location_id: number;
  active: boolean;
  location_name?: string;
}

export interface LocationWithSensors {
  id: number;
  name: string;
  sensors: Device[];
}

export function useDevices(page: number = 1, limit: number = 15) {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [paginatedDevices, setPaginatedDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axiosPrivate
      .get("/devices/accessible")
      .then((res) => {
        // El nuevo formato es un array de locations con sensors
        const locations: LocationWithSensors[] = Array.isArray(res.data)
          ? res.data
          : [];

        // Aplanar todos los sensores de todas las ubicaciones
        const flatDevices: Device[] = locations.flatMap((location) =>
          location.sensors.map((sensor) => ({
            ...sensor,
            location_name: location.name, // Agregar el nombre de la ubicación para referencia
          })),
        );

        setAllDevices(flatDevices);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setPaginatedDevices(allDevices.slice(startIndex, endIndex));
  }, [page, limit, allDevices]);

  const totalPages = Math.ceil(allDevices.length / limit);

  return {
    devices: paginatedDevices,
    loading,
    error,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      totalItems: allDevices.length,
    },
  };
}
