import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient";
import { useLanguage } from "../useLanguage";

export interface EmailAttachment {
  imageBase64: string;
  filename: string;
  widgetType: string;
}

export function useSendChartEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCurrentLanguage } = useLanguage();

  const sendChartEmail = async (attachment: EmailAttachment) => {
    setLoading(true);
    setError(null);
    try {
      const currentLanguage = getCurrentLanguage();
      const payload = {
        ...attachment,
        language: currentLanguage,
      };

      const res = await axiosPrivate.post("/email/graph", payload);
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
