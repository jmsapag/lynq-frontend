import { useState } from "react";
import { axiosPrivate } from "../../services/axiosClient.ts";

interface SendInvitationsParams {
  emails: string[];
  role: "ADMIN" | "STANDARD" | "LYNQ_TEAM";
  business_id: number;
  language?: "es" | "en";
}

interface SendInvitationsResponse {
  success: boolean;
  invitations: string[];
}

export function useSendInvitations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendInvitations = async (
    params: SendInvitationsParams,
  ): Promise<SendInvitationsResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosPrivate.post<SendInvitationsResponse>(
        "/registration-tokens/send-invitations",
        {
          emails: params.emails,
          role: params.role,
          business_id: params.business_id,
          language: params.language || "es",
        },
      );
      return res.data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        "Error sending invitations.";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendInvitations, loading, error };
}
