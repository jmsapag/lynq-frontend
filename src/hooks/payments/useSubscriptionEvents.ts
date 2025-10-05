import { useState, useEffect } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface ManualSubscription {
  id: number;
  businessId: number;
  priceAmount: number;
  status: string;
  nextExpirationDate: string;
  invoiceFileName: string;
  invoiceMimeType: string;
  invoiceUploadedAt: string;
  invoiceApprovedAt: string | null;
  invoiceApprovedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionFilters {
  businessId?: number;
  status?: string;
}

const getManualSubscriptions = async (
  filters: SubscriptionFilters,
): Promise<ManualSubscription[]> => {
  const params = new URLSearchParams();

  if (filters.businessId)
    params.append("businessId", filters.businessId.toString());
  if (filters.status) params.append("status", filters.status);

  const response = await axiosPrivate.get(
    `/manual-subscriptions?${params.toString()}`,
  );
  return response.data;
};

export const useManualSubscriptions = (filters: SubscriptionFilters = {}) => {
  const [subscriptions, setSubscriptions] = useState<ManualSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getManualSubscriptions(filters);
      setSubscriptions(data);
    } catch (err) {
      setError("Error al cargar las suscripciones manuales");
      console.error("Error fetching manual subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [filters.businessId, filters.status]);

  return {
    subscriptions,
    loading,
    error,
    refetch: fetchSubscriptions,
  };
};
