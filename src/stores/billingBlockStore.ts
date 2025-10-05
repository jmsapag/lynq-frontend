import { SubscriptionStatus } from "../types/subscription";

type BillingStatus = SubscriptionStatus | "none" | null;

export interface BillingBlockState {
  blocked: boolean;
  status: BillingStatus;
  reason: string | null;
}

type Listener = (state: BillingBlockState) => void;

let state: BillingBlockState = {
  blocked: false,
  status: null,
  reason: null,
};

const listeners = new Set<Listener>();

const notify = () => {
  for (const listener of listeners) {
    listener(state);
  }
};

export const subscribeBillingBlock = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const setState = (partial: Partial<BillingBlockState>) => {
  state = {
    ...state,
    ...partial,
  };
  notify();
};

export const getBillingBlockState = () => state;

export const setBillingBlocked = (
  status?: BillingStatus,
  reason?: string | null,
) => {
  setState({
    blocked: true,
    status: status ?? state.status,
    reason: reason ?? state.reason,
  });
};

export const clearBillingBlock = () => {
  setState({ blocked: false, status: null, reason: null });
};

export const setBillingBlockStatus = (status: BillingStatus) => {
  setState({ status });
};

export const setBillingBlockReason = (reason: string | null) => {
  setState({ reason });
};

export const setBillingBlockFlag = (blocked: boolean) => {
  setState({ blocked });
};
