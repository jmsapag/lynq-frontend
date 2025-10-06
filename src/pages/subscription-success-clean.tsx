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
            _timestamp: timestamp,
            _attempt: attempt,
          },
          {
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
              "X-Request-ID": `refresh-${timestamp}-${attempt}`,
            },
            params: {
              _t: timestamp,
              _a: attempt,
            },
          },
        );

        const newPayload = JSON.parse(atob(response.data.token.split(".")[1]));

        const isSubscriptionActive =
          newPayload.subscriptionState === "active" ||
          newPayload.subscriptionState === "trialing" ||
          newPayload.subscriptionState === "manually_managed_active";

        if (isSubscriptionActive) {
          Cookies.set("token", response.data.token, {
            secure: true,
            sameSite: "strict",
          });
          refreshAuthState();
          setSubscriptionActivated(true);

          setTimeout(() => {
            setIsRefreshing(false);
          }, 500);
          return;
        } else {
          if (attempt >= maxRetries) {
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
        if (attempt === maxRetries) {
          setIsRefreshing(false);
          return;
        }
      }
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (hasRefreshed.current) {
      return;
    }

    hasRefreshed.current = true;
    triggerTokenRefresh();
  }, []);

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
