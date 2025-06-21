import { axiosPrivate } from "../../services/axiosClient.ts";
import { useEffect, useState } from "react";
import { Location } from "../../types/location.ts";

export const useFetchLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axiosPrivate.get("/locations");
        setLocations(response.data);
      } catch (err) {
        setError("Failed to fetch locations");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { locations, loading, error };
};
