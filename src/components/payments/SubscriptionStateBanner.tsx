import { Card, CardBody, Button, Chip } from "@heroui/react";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  getSubscriptionStateFromToken,
  getIsManuallyManagedFromToken,
} from "../../hooks/auth/useAuth";
import type { SubscriptionState } from "../../types/subscription";

export const SubscriptionStateBanner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const subscriptionState = getSubscriptionStateFromToken();
  const isManuallyManaged = getIsManuallyManagedFromToken();

  // Don't show banner if subscription is active or if there's no state
  if (
    !subscriptionState ||
    subscriptionState === "active" ||
    subscriptionState === "trialing" ||
    subscriptionState === "manually_managed_active"
  ) {
    return null;
  }

  const getBannerConfig = (state: SubscriptionState) => {
    switch (state) {
      case "manually_managed_pending":
        return {
          icon: InformationCircleIcon,
          color: "primary",
          bgColor: "bg-primary-50/60",
          borderColor: "border-primary-200",
          textColor: "text-primary-700",
          titleKey: "subscriptionBanner.manualPending.title",
          descriptionKey: "subscriptionBanner.manualPending.description",
          chipLabel: t("subscriptionBanner.manualPending.chip"),
          showAction: false,
        };
      case "manually_managed_payment_due":
        return {
          icon: ExclamationTriangleIcon,
          color: "warning",
          bgColor: "bg-warning-50/60",
          borderColor: "border-warning-200",
          textColor: "text-warning-700",
          titleKey: "subscriptionBanner.manualPaymentDue.title",
          descriptionKey: "subscriptionBanner.manualPaymentDue.description",
          chipLabel: t("subscriptionBanner.manualPaymentDue.chip"),
          showAction: true,
          actionLabel: t("subscriptionBanner.manualPaymentDue.action"),
        };
      case "manually_managed_blocked":
        return {
          icon: XCircleIcon,
          color: "danger",
          bgColor: "bg-danger-50/60",
          borderColor: "border-danger-200",
          textColor: "text-danger-700",
          titleKey: "subscriptionBanner.manualBlocked.title",
          descriptionKey: "subscriptionBanner.manualBlocked.description",
          chipLabel: t("subscriptionBanner.manualBlocked.chip"),
          showAction: true,
          actionLabel: t("subscriptionBanner.manualBlocked.action"),
        };
      case "past_due":
        return {
          icon: ExclamationTriangleIcon,
          color: "warning",
          bgColor: "bg-warning-50/60",
          borderColor: "border-warning-200",
          textColor: "text-warning-700",
          titleKey: "subscriptionBanner.pastDue.title",
          descriptionKey: "subscriptionBanner.pastDue.description",
          chipLabel: t("subscriptionBanner.pastDue.chip"),
          showAction: true,
          actionLabel: t("subscriptionBanner.pastDue.action"),
        };
      case "unpaid":
      case "canceled":
      case "incomplete_expired":
        return {
          icon: XCircleIcon,
          color: "danger",
          bgColor: "bg-danger-50/60",
          borderColor: "border-danger-200",
          textColor: "text-danger-700",
          titleKey: "subscriptionBanner.unpaid.title",
          descriptionKey: "subscriptionBanner.unpaid.description",
          chipLabel: t("subscriptionBanner.unpaid.chip"),
          showAction: true,
          actionLabel: t("subscriptionBanner.unpaid.action"),
        };
      default:
        return null;
    }
  };

  const config = getBannerConfig(subscriptionState);

  if (!config) return null;

  const Icon = config.icon;

  const handleAction = () => {
    if (isManuallyManaged) {
      navigate("/billing");
    } else {
      navigate("/billing/subscription");
    }
  };

  return (
    <Card
      className={`border ${config.borderColor} ${config.bgColor} shadow-sm mb-6`}
    >
      <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 flex-shrink-0">
            <Icon
              className={`h-5 w-5 ${config.textColor}`}
              aria-hidden="true"
            />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-base font-semibold ${config.textColor}`}>
                {t(config.titleKey)}
              </h3>
              <Chip size="sm" color={config.color as any} variant="flat">
                {config.chipLabel}
              </Chip>
            </div>
            <p className="text-sm text-gray-700">{t(config.descriptionKey)}</p>
          </div>
        </div>
        {config.showAction && (
          <div className="flex-shrink-0">
            <Button
              color={config.color as any}
              variant="flat"
              onPress={handleAction}
              size="sm"
            >
              {config.actionLabel}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
