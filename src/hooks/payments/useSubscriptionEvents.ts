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
  type: "manual";
}

export interface StripeSubscription {
  stripeSubscriptionId: string;
  status: string;
  priceId: string;
  "amount/month": number;
  "sensor-qty": number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialStart: string | null;
  trialEnd: string | null;
  defaultPaymentMethodId: string;
  pricing: {
    id: string;
    unitAmount: number;
    billingScheme: string;
    tiers: Array<{
      up_to: number | null;
      unit_amount: number;
    }>;
  };
  type: "stripe";
}

export interface UnifiedSubscription {
  id: string | number;
  businessId?: number;
  type: "manual" | "stripe";
  status: string;
  priceAmount: number;
  nextExpirationDate: string;
  createdAt?: string;
  // Stripe specific fields
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  sensorQty?: number;
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
  return response.data.map((sub: any) => ({ ...sub, type: "manual" as const }));
};

const getStripeSubscriptions = async (): Promise<StripeSubscription[]> => {
  const response = await axiosPrivate.get("/stripe/subscriptions");
  return response.data.map((sub: any) => ({ ...sub, type: "stripe" as const }));
};

const unifySubscriptions = (
  manualSubs: ManualSubscription[],
  stripeSubs: StripeSubscription[],
  filters: SubscriptionFilters,
): UnifiedSubscription[] => {
  const unified: UnifiedSubscription[] = [];

  // Add manual subscriptions
  manualSubs.forEach((sub) => {
    unified.push({
      id: sub.id,
      businessId: sub.businessId,
      type: "manual",
      status: sub.status,
      priceAmount: sub.priceAmount,
      nextExpirationDate: sub.nextExpirationDate,
      createdAt: sub.createdAt,
    });
  });

  // Add stripe subscriptions
  stripeSubs.forEach((sub) => {
    // Apply status filter for Stripe subscriptions
    if (filters.status && sub.status !== filters.status) return;

    unified.push({
      id: sub.stripeSubscriptionId,
      type: "stripe",
      status: sub.status,
      priceAmount: sub["amount/month"] * 100, // Convert to cents
      nextExpirationDate: sub.currentPeriodEnd,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      sensorQty: sub["sensor-qty"],
    });
  });

  return unified;
};

export const useAllSubscriptions = (filters: SubscriptionFilters = {}) => {
  const [subscriptions, setSubscriptions] = useState<UnifiedSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const [manualData, stripeData] = await Promise.all([
        getManualSubscriptions(filters),
        getStripeSubscriptions(),
      ]);

      const unifiedData = unifySubscriptions(manualData, stripeData, filters);
      setSubscriptions(unifiedData);
    } catch (err) {
      setError("Error al cargar las suscripciones");
      console.error("Error fetching subscriptions:", err);
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

export const useUpdateManualSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSubscription = async (
    businessId: number,
    data: {
      priceAmount: number;
      status: string;
      nextExpirationDate: string;
    },
  ): Promise<ManualSubscription> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosPrivate.patch(
        `/manual-subscriptions/${businessId}`,
        data,
      );
      return response.data;
    } catch (err) {
      setError("Error al actualizar la suscripción");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateSubscription,
    loading,
    error,
  };
};
