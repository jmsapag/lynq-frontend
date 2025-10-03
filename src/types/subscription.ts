export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "paused"
  | "none";

export interface PricingTier {
  up_to: number | null;
  unit_amount: number;
}

export interface PricingInfo {
  id: string;
  unitAmount?: number;
  billingScheme: "tiered" | "per_unit" | "graduated";
  tiers?: PricingTier[];
  [key: string]: unknown;
}

export interface SubscriptionStatusResponse {
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  priceId: string | null;
  "amount/month": number | null;
  "sensor-qty": number | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean | null;
  defaultPaymentMethodId: string | null;
  pricing: PricingInfo | null;
}

export interface NoSubscriptionResponse {
  message: string;
  status: "none";
}

export type GetSubscriptionResponse =
  | SubscriptionStatusResponse
  | NoSubscriptionResponse;
