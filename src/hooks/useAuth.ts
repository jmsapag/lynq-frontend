import { useState } from "react";
import Cookies from "js-cookie";
import { axiosClient } from "../services/axiosClient";

export function getUserRoleFromToken() {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.post("/auth/login", {
        email,
        password,
      });
      Cookies.set("token", data.token, { secure: true, sameSite: "strict" });
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
