import { useState, useEffect } from "react";
import { axiosPrivate } from "../../services/axiosClient";

export interface ManualSubscription {
  id: number;
  businessId: number;
  businessName: string;
  "sensor-qty": number;
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
  business: {
    id: number;
    name: string;
    address: string;
  };
  "amount/month": number | null;
  "sensor-qty": number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialStart: string | null;
  trialEnd: string | null;
  defaultPaymentMethodId: string | null;
  pricing: {
    id: string;
    unitAmount: number | null;
    unitAmountDecimal: string | null;
    currency: string;
    billingScheme: string;
    taxBehavior: string;
    tiers: Array<{
      up_to: number | null;
      flat_amount: number | null;
      unit_amount: number;
      flat_amount_decimal: string | null;
      unit_amount_decimal: string;
    }>;
  };
  type: "stripe";
}

export interface UnifiedSubscription {
  id: string | number;
  businessId?: number;
  businessName?: string;
  type: "manual" | "stripe";
  status: string;
  priceAmount: number;
  nextExpirationDate: string;
  createdAt?: string;
  // Stripe specific fields
  stripeSubscriptionId?: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  trialStart?: string | null;
  trialEnd?: string | null;
  sensorQty?: number;
  pricing?: {
    id: string;
    unitAmount: number | null;
    unitAmountDecimal: string | null;
    currency: string;
    billingScheme: string;
    taxBehavior: string;
    tiers: Array<{
      up_to: number | null;
      flat_amount: number | null;
      unit_amount: number;
      flat_amount_decimal: string | null;
      unit_amount_decimal: string;
    }>;
  };
}

export interface SubscriptionFilters {
  businessName?: string;
  status?: string;
}

const getManualSubscriptions = async (
  filters: SubscriptionFilters,
): Promise<ManualSubscription[]> => {
  const params = new URLSearchParams();

  if (filters.businessName) params.append("businessName", filters.businessName);
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

// Helper function to calculate tiered pricing
const calculateTieredPrice = (
  sensorQty: number,
  pricing: StripeSubscription["pricing"],
): number => {
  if (!pricing || !pricing.tiers || pricing.tiers.length === 0) {
    return 0;
  }

  // Find the appropriate tier for the sensor quantity
  for (const tier of pricing.tiers) {
    const tierLimit = tier.up_to;

    // If this tier has no upper limit (up_to is null) or the sensor qty is within this tier's range
    if (tierLimit === null || sensorQty <= tierLimit) {
      return sensorQty * (tier.unit_amount / 100); // Convert cents to dollars
    }
  }

  return 0;
};

// Helper function to determine next expiration date
const getNextExpirationDate = (sub: StripeSubscription): string => {
  // If currentPeriodEnd is available, use it
  if (sub.currentPeriodEnd) {
    return sub.currentPeriodEnd;
  }

  // If currentPeriodEnd is null but trialEnd is available, use trialEnd
  if (sub.trialEnd) {
    return sub.trialEnd;
  }

  // Fallback to currentPeriodStart if available
  if (sub.currentPeriodStart) {
    return sub.currentPeriodStart;
  }

  // Last resort: use trialStart
  return sub.trialStart || new Date().toISOString();
};

const unifySubscriptions = (
  manualSubs: ManualSubscription[],
  stripeSubs: StripeSubscription[],
  filters: SubscriptionFilters,
): UnifiedSubscription[] => {
  const unified: UnifiedSubscription[] = [];

  // Add manual subscriptions
  manualSubs.forEach((sub) => {
    // Apply business name filter for manual subscriptions
    if (
      filters.businessName &&
      sub.businessName &&
      !sub.businessName
        .toLowerCase()
        .includes(filters.businessName.toLowerCase())
    ) {
      return;
    }

    unified.push({
      id: sub.id,
      businessId: sub.businessId,
      businessName: sub.businessName,
      type: "manual",
      status: sub.status,
      priceAmount: sub.priceAmount,
      nextExpirationDate: sub.nextExpirationDate,
      createdAt: sub.createdAt,
      sensorQty: sub["sensor-qty"],
    });
  });

  // Add stripe subscriptions
  stripeSubs.forEach((sub) => {
    // Apply status filter for Stripe subscriptions
    if (filters.status && sub.status !== filters.status) return;

    // Apply business name filter for Stripe subscriptions
    if (
      filters.businessName &&
      sub.business &&
      !sub.business.name
        .toLowerCase()
        .includes(filters.businessName.toLowerCase())
    ) {
      return;
    }

    // Calculate price based on tiered pricing
    const calculatedPrice =
      sub["amount/month"] !== null
        ? sub["amount/month"] * 100
        : calculateTieredPrice(sub["sensor-qty"], sub.pricing) * 100;

    unified.push({
      id: sub.stripeSubscriptionId,
      businessId: sub.business?.id,
      businessName: sub.business?.name,
      type: "stripe",
      status: sub.status,
      priceAmount: calculatedPrice,
      nextExpirationDate: getNextExpirationDate(sub),
      stripeSubscriptionId: sub.stripeSubscriptionId,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      trialStart: sub.trialStart,
      trialEnd: sub.trialEnd,
      sensorQty: sub["sensor-qty"],
      pricing: sub.pricing,
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
  }, [filters.businessName, filters.status]);

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
  }, [filters.businessName, filters.status]);

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

export const useCreateManualSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubscription = async (data: {
    businessId: number;
    priceAmount: number;
    status: string;
    nextExpirationDate?: string;
  }): Promise<ManualSubscription> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosPrivate.post("/manual-subscriptions", data);
      return response.data;
    } catch (err) {
      setError("Error al crear la suscripción");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createSubscription,
    loading,
    error,
  };
};
