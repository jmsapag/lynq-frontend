import { axiosPrivate } from "./axiosClient";
import { GetSubscriptionResponse } from "../types/subscription";

export const getSubscriptionStatus =
  async (): Promise<GetSubscriptionResponse> => {
    const response = await axiosPrivate.get<GetSubscriptionResponse>(
      "/stripe/subscription",
    );
    return response.data;
  };
