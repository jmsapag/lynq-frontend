import { useEffect, useState } from "react";
import { axiosClient } from "../services/axiosClient";

interface Sensor {
  id: number;
  position: string;
}

interface Location {
  id: number;
  name: string;
  sensors: Sensor[];
}

function useLocationsAndSensors() {
  const BUSINESS_ID = 5; // Constant business ID
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationsAndSensors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosClient.get<Location[]>("/devices/", {
          params: {
            business_id: BUSINESS_ID,
          },
        });
        setLocations(response.data);
      } catch (err) {
        setError("Error fetching locations and sensors");
        console.error("Error fetching locations and sensors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationsAndSensors();
  }, []);

  return { locations, loading, error };
}

export default useLocationsAndSensors; 