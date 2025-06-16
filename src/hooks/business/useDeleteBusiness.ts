import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export function useDeleteBusiness() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBusiness = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await axiosPrivate.delete(`/business/${id}`);
      return true;
    } catch (err: any) {
      setError(err.message || "Error deleting business");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteBusiness, loading, error };
}
