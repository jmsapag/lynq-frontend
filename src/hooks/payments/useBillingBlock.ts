import { useSyncExternalStore } from "react";
import {
  subscribeBillingBlock,
  getBillingBlockState,
  setBillingBlocked,
  clearBillingBlock,
  setBillingBlockStatus,
  setBillingBlockReason,
  setBillingBlockFlag,
} from "../../stores/billingBlockStore";

export const useBillingBlock = () => {
  const state = useSyncExternalStore(
    subscribeBillingBlock,
    getBillingBlockState,
  );

  return {
    ...state,
    setBillingBlocked,
    clearBillingBlock,
    setBillingBlockStatus,
    setBillingBlockReason,
    setBillingBlockFlag,
  };
};
