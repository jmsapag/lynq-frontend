import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";
import { AxiosError } from "axios";

export function useSubscribeEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribeEmail = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Endpoint for authenticated users - user is identified by the Bearer token
      await axiosPrivate.post("/users/self/subscribe-email");
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to subscribe to email";
        setError(errorMessage);
      } else if (err instanceof Error) {
        setError(err.message || "Failed to subscribe to email");
      } else {
        setError("Failed to subscribe to email");
      }
      return false;
    }
  };

  return { subscribeEmail, loading, error };
}
