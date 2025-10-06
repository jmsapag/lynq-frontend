import { useState } from "react";
import Cookies from "js-cookie";
import { axiosClient } from "../../services/axiosClient.ts";
import type { SubscriptionState } from "../../types/subscription.ts";
import { clearBillingBlock } from "../../stores/billingBlockStore.ts";

export function getUserRoleFromToken() {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

export function getBusinessIdFromToken() {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.businessId || null;
  } catch {
    return null;
  }
}

export function getUserIdFromToken() {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
}

export function getSubscriptionStateFromToken(): SubscriptionState | null {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.subscriptionState || null;
  } catch {
    return null;
  }
}

export function getIsManuallyManagedFromToken(): boolean {
  const token = Cookies.get("token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.isManuallyManaged === true;
  } catch {
    return false;
  }
}

// Check if user has access based on subscription state
// Optionally allow access to specific paths even when blocked
export function hasSubscriptionAccess(currentPath?: string): boolean {
  const subscriptionState = getSubscriptionStateFromToken();

  if (!subscriptionState) return true; // No subscription state means old token or no restrictions

  // Allow access to billing pages even when blocked
  const billingPaths = [
    "/billing",
    "/billing/subscription",
    "/help",
    "/profile",
  ];
  if (
    currentPath &&
    billingPaths.some((path) => currentPath.startsWith(path))
  ) {
    return true;
  }

  // Blocked states that should prevent access
  const blockedStates: SubscriptionState[] = [
    "manually_managed_blocked",
    "unpaid",
    "canceled",
    "incomplete_expired",
  ];

  return !blockedStates.includes(subscriptionState);
}

// Check if user is currently blocked based on JWT subscription state
export function isUserBlocked(): boolean {
  const subscriptionState = getSubscriptionStateFromToken();

  if (!subscriptionState) return false;

  const blockedStates: SubscriptionState[] = [
    "manually_managed_blocked",
    "unpaid",
    "canceled",
    "incomplete_expired",
  ];

  return blockedStates.includes(subscriptionState);
}

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Clear any previous billing block state before login
      clearBillingBlock();

      const { data } = await axiosClient.post("/auth/login", {
        email,
        password,
      });
      // Store both access token and refresh token
      Cookies.set("token", data.token, { secure: true, sameSite: "strict" });
      Cookies.set("refreshToken", data.refreshToken, {
        secure: true,
        sameSite: "strict",
      });
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
