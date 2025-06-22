import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient.ts";

export const useToggleUserActive = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleUserActive = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await axiosPrivate.patch(`/users/soft-delete/${id}`);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error toggling user active state",
      );
      setLoading(false);
      return false;
    }
  };

  return { toggleUserActive, loading, error };
};
