import { useState } from "react";
import { axiosClient } from "../../services/axiosClient";

export interface RegisterPayload {
  token?: string;
  name: string;
  email: string;
  password: string;
}

export function useRegister() {
  const [loading, setLoading] = useState(false);

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      const response = await axiosClient.post("/auth/register", payload);
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { register, loading };
}
