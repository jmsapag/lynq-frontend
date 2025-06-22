import { useState, useEffect } from "react";
import { axiosPrivate } from "../../services/axiosClient";
import { LocationWithUsers, UserWithLocations } from "../../types/location";

export function useUsersByLocations(pageSize = 100, index = 0) {
  const [users, setUsers] = useState<UserWithLocations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get<LocationWithUsers[]>(
          `/locations/users?index=${index}&pageSize=${pageSize}`,
        );

        // Transform data from locations with users to users with locations
        const locationData = response.data;
        const usersMap = new Map<number, UserWithLocations>();

        // Process each location and its users
        locationData.forEach((location) => {
          location.users.forEach((user) => {
            // If we've seen this user before, add the location to their locations array
            if (usersMap.has(user.id)) {
              usersMap.get(user.id)!.locations.push({
                id: location.id,
                name: location.name,
              });
            } else {
              // Otherwise create a new user entry
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

        // Convert the map to an array
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
  }, [index, pageSize]);

  return { users, setUsers, loading, error };
}
