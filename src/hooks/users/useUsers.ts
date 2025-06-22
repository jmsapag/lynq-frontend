import { useEffect, useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface User {
  id: number;
  email: string;
  role: string;
  business?: { id: number; name: string } | null;
  created_at: string;
  is_active: boolean;
}

export function useUsers(page = 1, limit = 15) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    axiosPrivate
      .get("/users")
      .then((res) => {
        const users = Array.isArray(res.data) ? res.data : [];
        setAllUsers(users);
      })
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setPaginatedUsers(allUsers.slice(startIndex, endIndex));
  }, [page, limit, allUsers]);

  const totalPages = Math.ceil(allUsers.length / limit);

  return {
    users: paginatedUsers,
    loading,
    error,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      totalItems: allUsers.length,
    },
  };
}
