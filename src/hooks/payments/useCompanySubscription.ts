import { useState, useEffect } from "react";
import { axiosPrivate } from "../../services/axiosClient";
import { getBusinessIdFromToken } from "../auth/useAuth";

export interface SubscriptionStatus {
  status: "TRIAL" | "ACTIVE" | "EXPIRED";
  planId: string | null;
  trialEndAt: string | null;
}

const getCompanySubscription = async (
  companyId: string,
): Promise<SubscriptionStatus> => {
  const response = await axiosPrivate.get(
    `/companies/${companyId}/subscription`,
  );
  return response.data;
};

export const useCompanySubscription = () => {
  const companyId = getBusinessIdFromToken();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getCompanySubscription(companyId);
      setSubscription(data);
    } catch (err) {
      setError("Error loading subscription status");
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [companyId]);

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
  };
};
