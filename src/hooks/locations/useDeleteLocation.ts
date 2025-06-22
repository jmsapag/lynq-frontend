import { axiosPrivate } from "../../services/axiosClient.ts";

export const useDeleteLocation = (onError: (error: Error) => void) => {
  const handleDeleteLocation = async (
    locationId: number,
    onSuccess: () => void,
  ) => {
    try {
      const response = await axiosPrivate.delete(`/locations/${locationId}`);
      if (response.status === 200) {
        onSuccess();
      } else {
        throw new Error("Failed to delete location");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  };

  return { handleDeleteLocation };
};
