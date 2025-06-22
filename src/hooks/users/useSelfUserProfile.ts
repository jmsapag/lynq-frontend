import { useEffect, useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface Business {
  id: number;
  name: string;
  address: string;
}

export interface UserProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  created_at: string;
  business_id: number;
  business: Business;
  is_active?: boolean;
}

export function useSelfUserProfile() {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    axiosPrivate
      .get<UserProfileData>("/users/self-info")
      .then((res) => {
        if (isMounted) setUser(res.data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              err.message ||
              "Unknown error",
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { user, loading, error, setUser };
}
