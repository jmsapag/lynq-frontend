import { axiosPrivate } from "./axiosClient";

export type PaymentMethodDto = {
  id: string;
  cardBrand: string | null;
  cardLast4: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
  country: string | null;
  createdAt: string;
};

export const listPaymentMethods = async (): Promise<PaymentMethodDto[]> => {
  const res = await axiosPrivate.get<PaymentMethodDto[]>(
    "/stripe/payment-methods",
  );
  return res.data;
};

export const deletePaymentMethod = async (paymentMethodId: string) => {
  await axiosPrivate.delete(`/stripe/payment-methods/${paymentMethodId}`);
};

export const setDefaultPaymentMethod = async (
  paymentMethodId: string,
): Promise<PaymentMethodDto> => {
  const res = await axiosPrivate.post<PaymentMethodDto>(
    "/stripe/payment-methods/default",
    { paymentMethodId },
  );
  return res.data;
};
