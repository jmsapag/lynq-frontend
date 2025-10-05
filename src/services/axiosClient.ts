import axios from "axios";
import Cookies from "js-cookie";
import { setBillingBlocked } from "../stores/billingBlockStore";
import type { SubscriptionStatus } from "../types/subscription";

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
  (error) => {
    if (error.response?.status === 402) {
      const statusFromServer = error.response?.data?.status;
      const messageFromServer = error.response?.data?.message;
      const typedStatus =
        typeof statusFromServer === "string" &&
        KNOWN_SUBSCRIPTION_STATUSES.has(
          statusFromServer as SubscriptionStatus | "none",
        )
          ? (statusFromServer as SubscriptionStatus | "none")
          : undefined;

      setBillingBlocked(typedStatus, messageFromServer ?? null);

      if (window.location.pathname !== "/billing/subscription") {
        window.location.href = "/billing/subscription";
      }
    }
    if (error.response?.status === 401) {
      // console.log("Unauthorized, redirecting to login");
      // Clear the token cookie since it's invalid
      Cookies.remove("token");
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
