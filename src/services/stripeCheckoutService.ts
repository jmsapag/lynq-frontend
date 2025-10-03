import { axiosPrivate } from "./axiosClient";

export type StripeCheckoutResponse = {
  url: string;
};

export const createStripeCheckoutSession = async (businessId: string): Promise<StripeCheckoutResponse> => {
  const res = await axiosPrivate.post<StripeCheckoutResponse>("/stripe/checkout", { businessId });
  return res.data;
};
