import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient.ts";

export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await axiosPrivate.delete(`/users/${id}`);
      setLoading(false);
      return true;
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || "Error deleting user");
      return false;
    }
  };

  return { deleteUser, loading, error };
};
