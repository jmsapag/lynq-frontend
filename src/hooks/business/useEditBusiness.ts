import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export function useEditBusiness() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editBusiness = async (id: number, name: string, address: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosPrivate.put(`/business/${id}`, { name, address });
      return true;
    } catch (err: any) {
      setError(err.message || "Error editing business");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { editBusiness, loading, error };
}
