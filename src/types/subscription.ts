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
  unitAmount?: number | null;
  billingScheme: "tiered" | "per_unit";
  currency: string;
  tiersMode?: "graduated" | "volume" | null;
  tiers?: PricingTier[];
  active?: boolean;
  nickname?: string | null;
  product?: string;
  sensorCount?: number | null;
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
  trialStart: string | null;
  trialEnd: string | null;
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

// Manual subscription statuses
export type ManualSubscriptionStatus =
  | "payment_due" // Default - awaiting payment/invoice
  | "pending_approval" // Invoice uploaded, awaiting approval
  | "active" // Approved and active
  | "blocked"; // Blocked/suspended by admin

export interface ManualSubscriptionResponse {
  id: number;
  businessId: number;
  priceAmount: number;
  status: ManualSubscriptionStatus;
  nextExpirationDate: string | null;
  invoiceFileName: string | null;
  invoiceMimeType: string | null;
  invoiceUploadedAt: string | null;
  invoiceApprovedAt: string | null;
  invoiceApprovedBy: number | null;
  createdAt: string;
  updatedAt: string;
}
