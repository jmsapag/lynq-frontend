import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-success-50 via-success-100 to-successs-200 px-4">
      <CheckCircleIcon className="w-20 h-20 text-success-500 mb-6" />
      <h1 className="text-4xl font-extrabold text-success-700 mb-3 text-center tracking-tight">
        {t("subscription.subscription/success")}
      </h1>
      <div className="w-full max-w-xl">
        <p className="text-lg text-black-800 mb-6 text-center">
          {t("subscription.subscription-success-message.desc")}
        </p>
        <p className="text-base text-gray-500 mb-10 text-center">
          {t("subscription.subscription-success-message.thanks")}
        </p>
      </div>
      <Button
        color="primary"
        className="px-8 py-3 text-lg font-semibold shadow-md bg-blue-600 hover:bg-success-700 text-white border-none"
        onPress={() => navigate("/dashboard")}
        aria-label={t(
          "subscription.subscription-success-message.goToDashboard",
        )}
      >
        {t("subscription.subscription-success-message.goToDashboard")}
      </Button>
    </div>
  );
}
