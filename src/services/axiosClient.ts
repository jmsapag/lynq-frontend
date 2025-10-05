import axios from "axios";
import Cookies from "js-cookie";
import {
  setBillingBlocked,
  clearBillingBlock,
} from "../stores/billingBlockStore";
import type {
  SubscriptionStatus,
  SubscriptionState,
} from "../types/subscription";

// Extend Axios config to support retry flag
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const KNOWN_SUBSCRIPTION_STATUSES = new Set<SubscriptionStatus | "none">([
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "paused",
  "none",
]);

const KNOWN_SUBSCRIPTION_STATES = new Set<SubscriptionState>([
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "paused",
  "none",
  "manually_managed_active",
  "manually_managed_pending",
  "manually_managed_payment_due",
  "manually_managed_blocked",
]);

const BACKEND_URL = "/api";

// console.log("BACKEND_URL:", BACKEND_URL, "DEV mode:", import.meta.env.DEV);

export const axiosClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const axiosPrivate = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Queue to store failed requests while refresh is in progress
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosPrivate.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 402 - Payment Required (subscription block)
    if (error.response?.status === 402) {
      const statusFromServer = error.response?.data?.status;
      const messageFromServer = error.response?.data?.message;
      const typedStatus =
        typeof statusFromServer === "string" &&
        (KNOWN_SUBSCRIPTION_STATUSES.has(
          statusFromServer as SubscriptionStatus | "none",
        ) ||
          KNOWN_SUBSCRIPTION_STATES.has(statusFromServer as SubscriptionState))
          ? (statusFromServer as
              | SubscriptionState
              | SubscriptionStatus
              | "none")
          : undefined;

      setBillingBlocked(typedStatus, messageFromServer ?? null);

      if (window.location.pathname !== "/billing/subscription") {
        window.location.href = "/billing/subscription";
      }
      return Promise.reject(error);
    }

    // Handle 401 - Unauthorized (token expired) or 498 - Token Expired/Invalid (subscription state outdated)
    if (
      (error.response?.status === 401 || error.response?.status === 498) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosPrivate(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get("refreshToken");

      if (!refreshToken) {
        // No refresh token, redirect to login
        isRefreshing = false;
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        clearBillingBlock();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Call refresh endpoint
        const { data } = await axiosClient.post("/auth/refresh", {
          refreshToken,
        });

        // Store new access token
        Cookies.set("token", data.token, { secure: true, sameSite: "strict" });

        // Process queued requests
        processQueue(null, data.token);
        isRefreshing = false;

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
        }
        return axiosPrivate(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        isRefreshing = false;
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        clearBillingBlock();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  },
);
