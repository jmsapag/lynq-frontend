import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType?: string;
}

export function useSendChartEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendChartEmail = async (attachment: EmailAttachment) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosPrivate.post("/email/graph", attachment);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendChartEmail, loading, error };
}
