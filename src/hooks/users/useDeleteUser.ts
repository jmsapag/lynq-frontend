import { axiosPrivate } from "../../services/axiosClient.ts";

export const useDeleteUser = (onError: (error: Error) => void) => {
  const handleDeleteUser = async (userId: number, onSuccess: () => void) => {
    try {
      const response = await axiosPrivate.delete(`/users/${userId}`);
      if (response.status === 200) {
        onSuccess();
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  };

  return { handleDeleteUser };
};
