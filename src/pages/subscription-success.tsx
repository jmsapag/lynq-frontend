import { useEffect, useState, useRef } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { refreshAuthState } from "../hooks/auth/useAuthState";
import Cookies from "js-cookie";
import { axiosClient } from "../services/axiosClient";

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [subscriptionActivated, setSubscriptionActivated] = useState(false);
  const hasRefreshed = useRef(false);

  const triggerTokenRefresh = async () => {
    const maxRetries = 8;
    const retryDelay = 3000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);

        if (attempt > 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }

        const refreshTokenValue = Cookies.get("refreshToken");
        const currentToken = Cookies.get("token");

        if (!refreshTokenValue) {
          setIsRefreshing(false);
          return;
        }

        const timestamp = Date.now();

        // Step 1: Force backend to sync subscription from Stripe
        try {
          await axiosClient.get("/stripe/subscription", {
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
              Authorization: `Bearer ${currentToken}`,
            },
            params: {
              _t: timestamp,
            },
          });
        } catch (syncError) {
          // Continue anyway - might fail if subscription isn't active yet
        }

        // Step 2: Refresh token to get updated subscriptionState
        const response = await axiosClient.post(
          "/auth/refresh",
          {
            refreshToken: refreshTokenValue,
            _timestamp: timestamp, // Add timestamp to body
            _attempt: attempt, // Add attempt number
          },
          {
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
              "X-Request-ID": `refresh-${timestamp}-${attempt}`, // Unique request ID
            },
            // Add timestamp to URL to prevent caching
            params: {
              _t: timestamp,
              _a: attempt,
            },
          },
        );

        console.log("📦 Response received:", {
          status: response.status,
          requestId: `refresh-${timestamp}-${attempt}`,
        });

        console.log("📦 Response received:", { status: response.status });

        // Decode and check new token
        const newPayload = JSON.parse(atob(response.data.token.split(".")[1]));
        console.log("� NEW token payload:", newPayload);
        console.log("📋 NEW subscriptionState:", newPayload.subscriptionState);

        // Check if subscription state is now active or trialing
        const isSubscriptionActive =
          newPayload.subscriptionState === "active" ||
          newPayload.subscriptionState === "trialing" ||
          newPayload.subscriptionState === "manually_managed_active";

        if (isSubscriptionActive) {
          // Success! Store the new token
          Cookies.set("token", response.data.token, {
            secure: true,
            sameSite: "strict",
          });
          console.log(
            "✅ Token refreshed successfully with active subscription!",
          );
          console.log("✅ New token stored in cookies");

          // Notify all components
          refreshAuthState();
          console.log("✅ Auth state refreshed - all components notified");

          setSubscriptionActivated(true);

          setTimeout(() => {
            setIsRefreshing(false);
            console.log("🏁 Refresh process completed successfully");
          }, 500);
          return; // Exit successfully
        } else {
          console.warn(
            `⚠️ Token still has blocked state: ${newPayload.subscriptionState}`,
          );

          if (attempt < maxRetries) {
            console.log(
              `🔄 Will retry... (${maxRetries - attempt} attempts remaining)`,
            );
            console.log(
              "💡 Waiting for Stripe webhook to update subscription in backend...",
            );
          } else {
            console.error(
              "❌ Max retries reached. Subscription state not updated.",
            );
            console.log(
              "💡 User can try clicking 'Go to Dashboard' - it may work after webhook completes",
            );

            // Store the token anyway - user might be able to access after webhook
            Cookies.set("token", response.data.token, {
              secure: true,
              sameSite: "strict",
            });
            refreshAuthState();
            setIsRefreshing(false);
            return;
          }
        }
      } catch (error: any) {
        console.error(`❌ Error on attempt ${attempt}:`, error);
        console.error("❌ Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        if (attempt === maxRetries) {
          console.error("❌ All refresh attempts failed");
          setIsRefreshing(false);
          return;
        }
      }
    }
  };

  useEffect(() => {
    // Check if user has a token, if not redirect to login
    const token = Cookies.get("token");
    if (!token) {
      console.log("⚠️ No token found, redirecting to login");
      navigate("/login", { replace: true });
      return;
    }

    // Prevent running twice in StrictMode or on re-renders
    if (hasRefreshed.current) {
      console.log("⚠️ Already refreshed, skipping...");
      return;
    }

    hasRefreshed.current = true;

    triggerTokenRefresh();
  }, []); // Empty array - run once on mount

  const handleManualRetry = () => {
    setIsRefreshing(true);
    setRetryCount(0);
    setSubscriptionActivated(false);
    hasRefreshed.current = false;
    triggerTokenRefresh();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  px-4">
      <CheckCircleIcon className="w-20 h-20 text-success-500 mb-6" />
      <h1 className="text-4xl font-extrabold text-gray-900 mb-3 text-center tracking-tight">
        {t("subscription.subscription/success")}
      </h1>
      <div className="w-full max-w-xl">
        <p className="text-lg text-black-800 mb-6 text-center">
          {t("subscription.subscription-success-message.desc")}
        </p>
        {isRefreshing && retryCount > 0 && (
          <p className="text-sm text-gray-500 mb-4 text-center">
            ⏳ Activating your subscription... (Attempt {retryCount}/8)
          </p>
        )}
        <p className="text-base text-gray-500 mb-10 text-center">
          {t("subscription.subscription-success-message.thanks")}
        </p>
      </div>
      <div className="flex flex-col gap-4 items-center">
        {!isRefreshing && !subscriptionActivated && (
          <Button
            color="warning"
            variant="bordered"
            className="px-6 py-2"
            onPress={handleManualRetry}
          >
            🔄 Retry Activate Subscription
          </Button>
        )}
        <Button
          color="primary"
          className="px-8 py-3 text-lg font-semibold shadow-md bg-blue-600 hover:bg-success-700 text-white border-none"
          onPress={() => navigate("/dashboard")}
          isLoading={isRefreshing}
          isDisabled={!subscriptionActivated && !isRefreshing}
          aria-label={t(
            "subscription.subscription-success-message.goToDashboard",
          )}
        >
          {t("subscription.subscription-success-message.goToDashboard")}
        </Button>
      </div>
    </div>
  );
}
