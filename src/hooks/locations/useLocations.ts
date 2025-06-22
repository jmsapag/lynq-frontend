import { useEffect, useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";
import { Location } from "../../types/location";

export function useLocations(page: number = 1, limit: number = 15) {
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [paginatedLocations, setPaginatedLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = () => {
    setLoading(true);
    setError(null);

    axiosPrivate
      .get("/locations")
      .then((res) => {
        const locations = Array.isArray(res.data) ? res.data : [];
        setAllLocations(locations);
      })
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setPaginatedLocations(allLocations.slice(startIndex, endIndex));
  }, [page, limit, allLocations]);

  const totalPages = Math.ceil(allLocations.length / limit);

  return {
    locations: paginatedLocations,
    allLocations,
    setAllLocations,
    loading,
    error,
    refetch: fetchLocations,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      totalItems: allLocations.length,
    },
  };
} 