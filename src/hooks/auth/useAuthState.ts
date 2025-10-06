import { useSyncExternalStore } from "react";
import Cookies from "js-cookie";
import type { SubscriptionState } from "../../types/subscription.ts";

// Types
interface JWTPayload {
  userId: string;
  businessId: string;
  role: string;
  subscriptionState?: SubscriptionState;
  isManuallyManaged?: boolean;
  exp: number;
}

interface AuthState {
  token: string | null;
  userId: string | null;
  businessId: string | null;
  role: string | null;
  subscriptionState: SubscriptionState | null;
  isManuallyManaged: boolean;
  isBlocked: boolean;
  isAuthenticated: boolean;
}

// Parse JWT token
function parseToken(token: string | undefined): JWTPayload | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

// Check if user is blocked based on subscription state
function checkIfBlocked(subscriptionState: SubscriptionState | null): boolean {
  if (!subscriptionState) return false;

  const blockedStates: SubscriptionState[] = [
    "manually_managed_blocked",
    "unpaid",
    "canceled",
    "incomplete_expired",
    "none",
  ];

  return blockedStates.includes(subscriptionState);
}

// Cached state to prevent infinite loops
let cachedState: AuthState | null = null;
let cachedToken: string | null = null;

// Get current auth state from cookies
function getAuthState(): AuthState {
  const token = Cookies.get("token");

  // Return cached state if token hasn't changed
  if (token === cachedToken && cachedState !== null) {
    return cachedState;
  }

  // Update cache
  cachedToken = token || null;

  const payload = parseToken(token);

  if (!payload) {
    cachedState = {
      token: null,
      userId: null,
      businessId: null,
      role: null,
      subscriptionState: null,
      isManuallyManaged: false,
      isBlocked: false,
      isAuthenticated: false,
    };
    return cachedState;
  }

  const subscriptionState = payload.subscriptionState || null;
  const isBlocked = checkIfBlocked(subscriptionState);

  cachedState = {
    token: token || null,
    userId: payload.userId || null,
    businessId: payload.businessId || null,
    role: payload.role || null,
    subscriptionState,
    isManuallyManaged: payload.isManuallyManaged === true,
    isBlocked,
    isAuthenticated: true,
  };

  return cachedState;
}

// Listeners for token changes
const listeners = new Set<() => void>();

// Subscribe to auth state changes
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Notify all listeners of state change
export function notifyAuthStateChange() {
  // Invalidate cache to force re-read from cookies
  cachedState = null;
  cachedToken = null;

  listeners.forEach((listener) => listener());
}

// Custom hook to use auth state reactively
export function useAuthState(): AuthState {
  const state = useSyncExternalStore(subscribe, getAuthState, getAuthState);
  return state;
}

// Helper to check subscription access
export function useSubscriptionAccess(currentPath?: string): boolean {
  const { subscriptionState, isBlocked } = useAuthState();

  if (!subscriptionState) return true; // No subscription state means no restrictions

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

  return !isBlocked;
}

// Trigger auth state update after token change
export function refreshAuthState() {
  console.log("🔄 Refreshing auth state...");
  notifyAuthStateChange();
}
