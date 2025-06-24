import { useState, useEffect } from "react";
import { axiosPrivate } from "../../services/axiosClient";
import { LocationWithUsers, UserWithLocations } from "../../types/location";

export function useUsersByLocations() {
  const [users, setUsers] = useState<UserWithLocations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response =
          await axiosPrivate.get<LocationWithUsers[]>(`/locations/users`);

        const locationData = response.data;
        const usersMap = new Map<number, UserWithLocations>();

        locationData.forEach((location) => {
          location.users.forEach((user) => {
            if (usersMap.has(user.id)) {
              usersMap.get(user.id)!.locations.push({
                id: location.id,
                name: location.name,
              });
            } else {
              usersMap.set(user.id, {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                locations:
                  location.id !== null && location.name !== "Unassigned"
                    ? [
                        {
                          id: location.id,
                          name: location.name,
                        },
                      ]
                    : [],
              });
            }
          });
        });

        setUsers(Array.from(usersMap.values()));
        setError(null);
      } catch (err) {
        console.error("Error fetching users by locations:", err);
        setError("Failed to fetch users by locations");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, setUsers, loading, error };
}
