import { axiosPrivate } from "../../services/axiosClient.ts";
import { useState } from "react";
import { AxiosError } from "axios";

export const useDeleteUser = (onError: (error: Error) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteUser = async (userId: number, onSuccess: () => void) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await axiosPrivate.delete(`/users/${userId}`);

      // Set loading to false first as we're done with the API call
      setIsLoading(false);

      // Handle successful response (both 200 OK and 204 No Content are valid success responses)
      if (response.status === 200 || response.status === 204) {
        onSuccess();
      } else {
        // Unexpected success status
        setError(`Unexpected response status: ${response.status}`);
      }
    } catch (error: unknown) {
      setIsLoading(false);

      if (axios$isAxiosError(error)) {
        // The request was made and the server responded with an error status code
        if (error.response?.status && error.response.status >= 400) {
          const errorMsg =
            error.response.data?.message ||
            `Error ${error.response.status}: Failed to delete user`;
          setError(errorMsg);
          onError(new Error(errorMsg));
        } else {
          // If we got a non-error status code, consider it a success
          onSuccess();
        }
      } else if (error instanceof Error) {
        // Something happened in setting up the request that triggered an Error
        setError(error.message || "Unknown error occurred");
        onError(error);
      } else {
        // Fallback for completely unknown errors
        setError("Unknown error occurred");
        onError(new Error("Unknown error"));
      }
    }
  };

  return { handleDeleteUser, isLoading, error };
};

// Type guard for Axios error
function axios$isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError)?.isAxiosError === true;
}
