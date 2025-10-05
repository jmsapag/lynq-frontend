import { axiosPrivate } from "./axiosClient";
import {
  GetSubscriptionResponse,
  ManualSubscriptionResponse,
  PricingInfo,
} from "../types/subscription";

export const getSubscriptionStatus =
  async (): Promise<GetSubscriptionResponse> => {
    const response = await axiosPrivate.get<GetSubscriptionResponse>(
      "/stripe/subscription",
    );
    return response.data;
  };

export const getStripePricing = async (): Promise<
  PricingInfo[] | PricingInfo
> => {
  const response = await axiosPrivate.get<PricingInfo[] | PricingInfo>(
    "/stripe/pricing",
  );
  return response.data;
};

// Manual subscription services
export const getManualSubscription = async (
  businessId: number,
): Promise<ManualSubscriptionResponse> => {
  const response = await axiosPrivate.get<ManualSubscriptionResponse>(
    `/manual-subscriptions/${businessId}`,
  );
  return response.data;
};

export const uploadInvoice = async (
  file: File,
): Promise<{ message: string; fileName: string }> => {
  const formData = new FormData();
  formData.append("invoice", file);

  const response = await axiosPrivate.post(
    `/manual-subscriptions/invoice`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const downloadInvoice = async (businessId: number): Promise<Blob> => {
  const response = await axiosPrivate.get(
    `/manual-subscriptions/${businessId}/invoice`,
    {
      responseType: "blob",
    },
  );
  return response.data;
};
