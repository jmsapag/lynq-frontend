import { axiosPrivate } from "../../services/axiosClient.ts";
import { UpdateUserResponse, UserRole } from "../../types/user";

export const useChangeRole = () => {
  const handleChangeRole = async (
    userId: number,
    newRole: UserRole,
    onSuccess: (updatedUser: UpdateUserResponse) => void,
    onError: (error: Error) => void,
  ) => {
    try {
      const response = await axiosPrivate.patch(`/users/role/${userId}`, {
        desiredRole: newRole,
      });

      if (response.status === 200) {
        const updatedUser = response.data as UpdateUserResponse;
        if (updatedUser.role === newRole) {
          onSuccess(updatedUser);
        } else {
          throw new Error("Role was not updated correctly");
        }
      } else {
        throw new Error("Failed to change user role");
      }
    } catch (error) {
      console.error("Error changing user role:", error);
      onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  };

  return { handleChangeRole };
};
