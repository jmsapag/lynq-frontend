import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";
import {
  setBillingBlocked,
  clearBillingBlock,
} from "../stores/billingBlockStore";
import type {
  SubscriptionStatus,
  SubscriptionState,
} from "../types/subscription";
import { refreshAuthState } from "../hooks/auth/useAuthState";

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

export const axiosClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Regular private instance for standard requests
export const axiosPrivate = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// AI-specific instance with extended timeout
export const axiosAI = axios.create({
  baseURL: BACKEND_URL,
  timeout: 120000, // 2 minutes for AI requests
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

// Setup interceptors for both instances - Fixed parameter type
const setupInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(
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

  axiosInstance.interceptors.response.use(
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
            KNOWN_SUBSCRIPTION_STATES.has(
              statusFromServer as SubscriptionState,
            ))
            ? (statusFromServer as
                | SubscriptionState
                | SubscriptionStatus
                | "none")
            : undefined;

        setBillingBlocked(typedStatus, messageFromServer ?? null);

        // Don't redirect if on success/cancel pages (user just paid, needs time to refresh token)
        const allowedPaths = [
          "/billing/subscription/success",
          "/billing/subscription/cancel",
          "/subscription/success",
          "/subscription/cancel",
        ];
        const isOnSuccessPage = allowedPaths.some(
          (path) => window.location.pathname === path,
        );

        if (
          !isOnSuccessPage &&
          window.location.pathname !== "/billing/subscription"
        ) {
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
              return axiosInstance(originalRequest);
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
          Cookies.set("token", data.token, {
            secure: true,
            sameSite: "strict",
          });

          // Notify all components using useAuthState that token has changed
          refreshAuthState();

          // Process queued requests
          processQueue(null, data.token);
          isRefreshing = false;

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
          }
          return axiosInstance(originalRequest);
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
};

// Apply interceptors to both instances
setupInterceptors(axiosPrivate);
setupInterceptors(axiosAI);
