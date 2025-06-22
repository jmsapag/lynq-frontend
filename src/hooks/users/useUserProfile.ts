import { useEffect, useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface Business {
  id: number;
  name: string;
  address: string;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  business_id: number;
  is_active: boolean;
  business: Business;
}

export interface UserProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  created_at: string;
  business_id: number;
  is_active: boolean;
  business: Business;
}

export function useUserProfile(userId: number | null) {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError("No user ID found");
      return;
    }
    setLoading(true);
    setError(null);

    axiosPrivate
      .get<UserProfileData>(`/users/${userId}`)
      .then((res) => setUser(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error, setUser };
}
