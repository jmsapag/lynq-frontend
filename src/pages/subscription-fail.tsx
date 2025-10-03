import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCallback, useState } from "react";
import { getBusinessIdFromToken } from "../hooks/auth/useAuth";
import { createStripeCheckoutSession } from "../services/stripeCheckoutService";

export default function SubscriptionFailPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const businessId = getBusinessIdFromToken();

  const [retrying, setRetrying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const handleRetry = useCallback(async () => {
    if (!businessId) return;
    setRetrying(true);
    setErrorMsg(null);
    try {
      const res = await createStripeCheckoutSession(businessId);
      window.location.href = res.url;
    } catch (err) {
      setRetrying(false);
      setErrorMsg(t("nav.subscription-fail-message.retryError", "No se pudo reintentar el pago. Intenta nuevamente más tarde."));
    }
  }, [businessId, t]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-error-50 via-error-100 to-error-200 px-4">
      <ExclamationCircleIcon className="w-20 h-20 text-error-500 mb-6" />
      <h1 className="text-4xl font-extrabold text-danger-500 mb-3 text-center tracking-tight">
        {t("nav.subscription/cancel", "Pago fallido")}
      </h1>
      <div className="w-full max-w-xl">
        <p className="text-lg text-error-800 mb-6 text-center">
          {t("nav.subscription-fail-message.desc", "Tu pago no pudo ser procesado. Por favor, revisa tus datos e intenta nuevamente.")}
        </p>
        <p className="text-base text-error-500 mb-10 text-center">
          {t("nav.subscription-fail-message.help", "Si el problema persiste, contacta a soporte")}
          {" "}
          <span>
            {t("nav.subscription-fail-message.orContact", "o contacta soporte ")}
            <a
              href="/help"
              className="text-blue-700 underline hover:text-blue-900"
              style={{ marginLeft: 2 }}
            >
              {t("nav.subscription-fail-message.here", "aquí")}
            </a>.
          </span>
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          color="primary"
          className="px-8 py-3 text-lg font-semibold shadow-md bg-blue-600 hover:bg-blue-700 text-white border-none"
          onPress={() => navigate("/dashboard")}
          aria-label={t("nav.subscription-fail-message.goToDashboard", "Ir al dashboard")}
        >
          {t("nav.subscription-fail-message.goToDashboard", "Ir al dashboard")}
        </Button>
        <Button
          color="primary"
          className="px-8 py-3 text-lg font-semibold shadow-md bg-error-500 hover:bg-error-700 text-black border-none"
          onPress={handleRetry}
          aria-label={t("nav.subscription-fail-message.retry", "Reintentar pago")}
          isDisabled={retrying}
        >
          {retrying
            ? t("nav.subscription-fail-message.retrying", "Reintentando...")
            : t("nav.subscription-fail-message.retry", "Reintentar pago")}
        </Button>
      </div>
      {errorMsg && (
        <div className="text-danger-600 text-sm mt-2 text-center">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
