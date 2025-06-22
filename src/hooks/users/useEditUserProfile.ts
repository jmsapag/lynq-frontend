import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface EditUserData {
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: string;
  business_id: number;
}

export function useEditUserProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editUser = async (id: number, data: EditUserData) => {
    setLoading(true);
    setError(null);
    try {
      await axiosPrivate.patch(`/users/${id}`, data);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user");
      setLoading(false);
      return false;
    }
  };

  return { editUser, loading, error };
}
