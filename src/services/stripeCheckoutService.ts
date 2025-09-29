import { axiosPrivate } from "./axiosClient";

export type StripeCheckoutResponse = {
  url: string;
};

export const createStripeCheckoutSession = async (planId: string): Promise<StripeCheckoutResponse> => {
  const res = await axiosPrivate.post<StripeCheckoutResponse>("/stripe/checkout", { planId });
  return res.data;
};
