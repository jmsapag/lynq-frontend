import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Spinner, Button, addToast } from "@heroui/react";
import {
  SubscriptionCard,
  type SubscriptionCardAction,
  type SubscriptionFeature,
} from "../components/payments/SubscriptionCard";
import {
  SubscriptionStateNotice,
  type NoticeTone,
} from "../components/payments/SubscriptionStateNotice";
import {
  getSubscriptionStatus,
  getStripePricing,
} from "../services/subscriptionService";
import { createStripeCheckoutSession } from "../services/stripeCheckoutService";
import { getBusinessIdFromToken } from "../hooks/auth/useAuth";
import { useBillingBlock } from "../hooks/payments/useBillingBlock";
import { useNavigate } from "react-router-dom";
import type {
  GetSubscriptionResponse,
  PricingInfo,
  SubscriptionStatus,
  SubscriptionStatusResponse,
} from "../types/subscription";
import {
  ChartBarIcon,
  ShieldCheckIcon,
  LifebuoyIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

const BLOCKING_STATUSES = new Set<
  SubscriptionStatus | "none" | "incomplete" | "incomplete_expired"
>([
  "none",
  "past_due",
  "unpaid",
  "canceled",
  "incomplete",
  "incomplete_expired",
]);

const isStripeSubscription = (
  value: GetSubscriptionResponse | null,
): value is SubscriptionStatusResponse => {
  return value !== null && "status" in value;
};

const resolveSensorCount = (
  subscription: GetSubscriptionResponse | null,
  pricing: PricingInfo | null,
) => {
  if (isStripeSubscription(subscription)) {
    const quantity = subscription["sensor-qty"];
    if (typeof quantity === "number" && quantity > 0) {
      return quantity;
    }
  }

  if (
    pricing &&
    typeof pricing.sensorCount === "number" &&
    pricing.sensorCount > 0
  ) {
    return pricing.sensorCount;
  }

  return 1;
};

const findVolumeTier = (tiers: PricingInfo["tiers"], sensors: number) => {
  if (!tiers || tiers.length === 0) {
    return null;
  }

  return tiers.find((tier, index) => {
    const previousLimit = index === 0 ? 0 : (tiers[index - 1].up_to ?? 0);
    const upperLimit = tier.up_to ?? Infinity;
    return sensors > previousLimit && sensors <= upperLimit;
  });
};

const calculateGraduatedTotal = (
  tiers: PricingInfo["tiers"],
  sensors: number,
): number | null => {
  if (!tiers || tiers.length === 0) {
    return null;
  }

  let remaining = sensors;
  let previousLimit = 0;
  let total = 0;

  for (const tier of tiers) {
    if (remaining <= 0) {
      break;
    }

    const upperLimit = tier.up_to ?? Infinity;
    const tierSpan =
      upperLimit === Infinity ? remaining : upperLimit - previousLimit;
    const applicableUnits = Math.min(remaining, tierSpan);

    if (applicableUnits > 0) {
      total += applicableUnits * tier.unit_amount;
      remaining -= applicableUnits;
    }

    previousLimit =
      upperLimit === Infinity ? previousLimit + applicableUnits : upperLimit;
  }

  return total > 0 ? total / 100 : null;
};

const getUnitPrice = (
  pricing: PricingInfo | null,
  sensors: number,
): number | null => {
  if (!pricing) {
    return null;
  }

  if (
    pricing.billingScheme === "per_unit" &&
    typeof pricing.unitAmount === "number"
  ) {
    return pricing.unitAmount / 100;
  }

  if (pricing.billingScheme === "tiered" && pricing.tiers?.length) {
    const tier = findVolumeTier(pricing.tiers, sensors);
    return tier ? tier.unit_amount / 100 : null;
  }

  return null;
};

const getEstimatedTotal = (
  pricing: PricingInfo | null,
  sensors: number,
): number | null => {
  if (!pricing || sensors <= 0) {
    return null;
  }

  if (
    pricing.billingScheme === "per_unit" &&
    typeof pricing.unitAmount === "number"
  ) {
    return (pricing.unitAmount * sensors) / 100;
  }

  if (pricing.billingScheme === "tiered" && pricing.tiers?.length) {
    if (pricing.tiersMode === "graduated") {
      return calculateGraduatedTotal(pricing.tiers, sensors);
    }

    const tier = findVolumeTier(pricing.tiers, sensors);
    return tier ? (tier.unit_amount * sensors) / 100 : null;
  }

  return null;
};

const getEffectiveStatus = (
  subscription: GetSubscriptionResponse | null,
): SubscriptionStatus | "none" => {
  if (!subscription) {
    return "none";
  }

  if (isStripeSubscription(subscription)) {
    return subscription.status;
  }

  return subscription.status ?? "none";
};

const getTrialDaysLeft = (
  subscription: SubscriptionStatusResponse | null,
): number | null => {
  if (!subscription?.trialEnd) {
    return null;
  }

  const endAt = new Date(subscription.trialEnd).getTime();
  if (Number.isNaN(endAt)) {
    return null;
  }

  const diff = Math.ceil((endAt - Date.now()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : 0;
};

type NoticeConfig = {
  tone: NoticeTone;
  title: string;
  description: string;
  helperText?: string;
  statusLabel: string;
  actions?: SubscriptionCardAction[];
};

const selectActivePricing = (
  value: PricingInfo[] | PricingInfo | null,
): PricingInfo | null => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.find((item) => item?.active !== false) ?? value[0] ?? null;
  }

  return value;
};

const formatErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "response" in error) {
    const err = error as { response?: { data?: { message?: string } } };
    return err.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const SubscriptionPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const businessId = getBusinessIdFromToken();

  const { setBillingBlockFlag, setBillingBlockStatus, setBillingBlockReason } =
    useBillingBlock();

  const [subscription, setSubscription] =
    useState<GetSubscriptionResponse | null>(null);
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const pricingPromise = getStripePricing().catch(() => null);
      const subscriptionResponse = await getSubscriptionStatus();
      const pricingResponse = await pricingPromise;

      setSubscription(subscriptionResponse);
      setPricing(selectActivePricing(pricingResponse));

      const status = getEffectiveStatus(subscriptionResponse);
      const shouldBlock = BLOCKING_STATUSES.has(status);
      const reason =
        shouldBlock && !isStripeSubscription(subscriptionResponse)
          ? (subscriptionResponse?.message ?? null)
          : null;

      setBillingBlockStatus(status);
      setBillingBlockFlag(shouldBlock);
      setBillingBlockReason(reason);
    } catch (err) {
      const fallback = t("subscriptionPage.errorGeneric");
      setError(formatErrorMessage(err, fallback));
    } finally {
      setLoading(false);
    }
  }, [setBillingBlockFlag, setBillingBlockReason, setBillingBlockStatus, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stripeSubscription = useMemo(() => {
    return isStripeSubscription(subscription) ? subscription : null;
  }, [subscription]);

  const effectiveStatus = useMemo(() => {
    return getEffectiveStatus(subscription);
  }, [subscription]);

  const sensorCount = useMemo(() => {
    return resolveSensorCount(subscription, pricing);
  }, [subscription, pricing]);

  const trialDaysLeft = useMemo(() => {
    return getTrialDaysLeft(stripeSubscription);
  }, [stripeSubscription]);

  const currencyCode = pricing?.currency ?? "USD";

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat(i18n.language || "en", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    });
  }, [currencyCode, i18n.language]);

  const unitPrice = useMemo(() => {
    return getUnitPrice(pricing, sensorCount);
  }, [pricing, sensorCount]);

  const estimatedTotal = useMemo(() => {
    return getEstimatedTotal(pricing, sensorCount);
  }, [pricing, sensorCount]);

  const formattedUnitPrice =
    unitPrice !== null
      ? currencyFormatter.format(unitPrice)
      : t("subscription.placeholders.notAvailable");

  const formattedEstimatedTotal =
    estimatedTotal !== null
      ? currencyFormatter.format(estimatedTotal)
      : t("subscription.placeholders.notAvailable");

  const pricePerSensorBlock = useMemo(
    () => ({
      label: t("subscription.labels.pricePerSensor"),
      value: formattedUnitPrice,
      helper: t("subscription.labels.pricePerSensorHelper"),
    }),
    [formattedUnitPrice, t],
  );

  const estimatedTotalBlock = useMemo(
    () => ({
      label: t("subscription.labels.estimatedMonthly"),
      value: formattedEstimatedTotal,
      helper: t("subscription.labels.estimatedTotalHelper"),
    }),
    [formattedEstimatedTotal, t],
  );

  const sensorSummary = useMemo(() => {
    return t("subscription.labels.sensorSummary", { count: sensorCount });
  }, [sensorCount, t]);

  const trialBadge = useMemo(() => {
    if (effectiveStatus === "trialing") {
      return trialDaysLeft !== null
        ? t("subscription.badges.trialing", { count: trialDaysLeft })
        : t("subscription.badges.trialActive");
    }

    if (effectiveStatus === "none") {
      return t("subscription.badges.freeTrial");
    }

    return undefined;
  }, [effectiveStatus, t, trialDaysLeft]);

  const features: SubscriptionFeature[] = useMemo(
    () => [
      {
        icon: ChartBarIcon,
        title: t("subscription.features.analytics.title"),
        description: t("subscription.features.analytics.description"),
      },
      {
        icon: BoltIcon,
        title: t("subscription.features.realTime.title"),
        description: t("subscription.features.realTime.description"),
      },
      {
        icon: ShieldCheckIcon,
        title: t("subscription.features.security.title"),
        description: t("subscription.features.security.description"),
      },
      {
        icon: LifebuoyIcon,
        title: t("subscription.features.support.title"),
        description: t("subscription.features.support.description"),
      },
    ],
    [t],
  );

  const handleCheckout = useCallback(async () => {
    if (!businessId) {
      addToast({
        title: t("subscription.toasts.noBusinessId.title"),
        description: t("subscription.toasts.noBusinessId.description"),
        color: "danger",
        severity: "danger",
      });
      return;
    }

    try {
      setCheckoutLoading(true);
      const response = await createStripeCheckoutSession(businessId);
      window.location.href = response.url;
    } catch (err) {
      addToast({
        title: t("subscription.toasts.checkoutError.title"),
        description: formatErrorMessage(
          err,
          t("subscription.toasts.checkoutError.description"),
        ),
        color: "danger",
        severity: "danger",
      });
    } finally {
      setCheckoutLoading(false);
    }
  }, [businessId, t]);

  const handleUpdatePayment = useCallback(() => {
    navigate("/new-payment-method");
  }, [navigate]);

  const handleManageBilling = useCallback(() => {
    navigate("/billing");
  }, [navigate]);

  const handleContactSupport = useCallback(() => {
    navigate("/help");
  }, [navigate]);

  const statusLabel = useMemo(() => {
    return t(`subscription.statusLabel.${effectiveStatus}`, {
      defaultValue: effectiveStatus,
    });
  }, [effectiveStatus, t]);

  const primaryActionAndNotice = useMemo(() => {
    let primaryAction: SubscriptionCardAction = {
      label: t("subscription.actions.subscribe"),
      onPress: handleCheckout,
      isLoading: checkoutLoading,
    };
    let secondaryAction: SubscriptionCardAction | undefined;
    let notice: NoticeConfig | null = null;

    const buildNotice = (
      tone: NoticeTone,
      title: string,
      description: string,
      actions?: SubscriptionCardAction[],
      helperText?: string,
    ): NoticeConfig => ({
      tone,
      title,
      description,
      helperText,
      statusLabel,
      actions,
    });

    switch (effectiveStatus) {
      case "active":
        primaryAction = {
          label: t("subscription.actions.manageBilling"),
          onPress: handleManageBilling,
        };
        secondaryAction = {
          label: t("subscription.actions.updatePayment"),
          onPress: handleUpdatePayment,
          variant: "bordered",
        };
        notice = buildNotice(
          "success",
          t("subscription.notice.active.title"),
          t("subscription.notice.active.description"),
          [
            {
              label: t("subscription.actions.manageBilling"),
              onPress: handleManageBilling,
              variant: "bordered",
            },
          ],
        );
        break;
      case "trialing":
        primaryAction = {
          label: t("subscription.actions.startPaidPlan"),
          onPress: handleCheckout,
          isLoading: checkoutLoading,
        };
        secondaryAction = {
          label: t("subscription.actions.manageBilling"),
          onPress: handleManageBilling,
          variant: "bordered",
        };
        notice = buildNotice(
          "info",
          t("subscription.notice.trialing.title", {
            count: trialDaysLeft ?? 0,
          }),
          t("subscription.notice.trialing.description"),
          [
            {
              label: t("subscription.actions.startPaidPlan"),
              onPress: handleCheckout,
              isLoading: checkoutLoading,
            },
            {
              label: t("subscription.actions.manageBilling"),
              onPress: handleManageBilling,
              variant: "bordered",
            },
          ],
          trialDaysLeft !== null
            ? t("subscription.notice.trialing.helper", {
                count: trialDaysLeft,
              })
            : undefined,
        );
        break;
      case "past_due":
        primaryAction = {
          label: t("subscription.actions.updatePayment"),
          onPress: handleUpdatePayment,
          color: "warning",
        };
        secondaryAction = {
          label: t("subscription.actions.contactSupport"),
          onPress: handleContactSupport,
          variant: "light",
        };
        notice = buildNotice(
          "warning",
          t("subscription.notice.pastDue.title"),
          t("subscription.notice.pastDue.description"),
          [
            {
              label: t("subscription.actions.updatePayment"),
              onPress: handleUpdatePayment,
              color: "warning",
            },
            {
              label: t("subscription.actions.contactSupport"),
              onPress: handleContactSupport,
              variant: "light",
            },
          ],
        );
        break;
      case "unpaid":
      case "canceled":
      case "incomplete":
      case "incomplete_expired":
        primaryAction = {
          label: t("subscription.actions.reactivate"),
          onPress: handleCheckout,
          color: "danger",
          isLoading: checkoutLoading,
        };
        secondaryAction = {
          label: t("subscription.actions.contactSupport"),
          onPress: handleContactSupport,
          variant: "bordered",
        };
        notice = buildNotice(
          "danger",
          t("subscription.notice.reactivate.title"),
          t("subscription.notice.reactivate.description"),
          [
            {
              label: t("subscription.actions.reactivate"),
              onPress: handleCheckout,
              color: "danger",
              isLoading: checkoutLoading,
            },
            {
              label: t("subscription.actions.contactSupport"),
              onPress: handleContactSupport,
              variant: "bordered",
            },
          ],
        );
        break;
      case "paused":
        primaryAction = {
          label: t("subscription.actions.resume"),
          onPress: handleCheckout,
          isLoading: checkoutLoading,
        };
        secondaryAction = {
          label: t("subscription.actions.contactSupport"),
          onPress: handleContactSupport,
          variant: "bordered",
        };
        notice = buildNotice(
          "info",
          t("subscription.notice.paused.title"),
          t("subscription.notice.paused.description"),
          [
            {
              label: t("subscription.actions.resume"),
              onPress: handleCheckout,
              isLoading: checkoutLoading,
            },
          ],
        );
        break;
      case "none":
      default:
        primaryAction = {
          label: t("subscription.actions.subscribe"),
          onPress: handleCheckout,
          isLoading: checkoutLoading,
        };
        secondaryAction = {
          label: t("subscription.actions.contactSupport"),
          onPress: handleContactSupport,
          variant: "light",
        };
        notice = buildNotice(
          "info",
          t("subscription.notice.none.title"),
          isStripeSubscription(subscription)
            ? t("subscription.notice.none.description")
            : (subscription?.message ??
                t("subscription.notice.none.description")),
          [
            {
              label: t("subscription.actions.subscribe"),
              onPress: handleCheckout,
              isLoading: checkoutLoading,
            },
            {
              label: t("subscription.actions.contactSupport"),
              onPress: handleContactSupport,
              variant: "light",
            },
          ],
        );
        break;
    }

    return { primaryAction, secondaryAction, notice };
  }, [
    checkoutLoading,
    effectiveStatus,
    handleCheckout,
    handleContactSupport,
    handleManageBilling,
    handleUpdatePayment,
    statusLabel,
    subscription,
    t,
    trialDaysLeft,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4">
        <p className="text-center text-danger-600">{error}</p>
        <Button color="primary" onPress={fetchData}>
          {t("subscription.actions.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("subscriptionPage.title")}
        </h1>
        <p className="text-base text-gray-500">
          {t("subscriptionPage.subtitle")}
        </p>
      </header>

      {primaryActionAndNotice.notice ? (
        <SubscriptionStateNotice
          tone={primaryActionAndNotice.notice.tone}
          title={primaryActionAndNotice.notice.title}
          description={primaryActionAndNotice.notice.description}
          helperText={primaryActionAndNotice.notice.helperText}
          statusLabel={primaryActionAndNotice.notice.statusLabel}
          actions={primaryActionAndNotice.notice.actions}
        />
      ) : null}

      <div className="flex w-full items-center justify-center">
        <SubscriptionCard
          title={t("subscription.card.title")}
          subtitle={t("subscription.card.subtitle")}
          pricePerSensor={pricePerSensorBlock}
          estimatedTotal={estimatedTotalBlock}
          sensorSummary={sensorSummary}
          trialBadge={trialBadge}
          features={features}
          primaryAction={primaryActionAndNotice.primaryAction}
          secondaryAction={primaryActionAndNotice.secondaryAction}
        />
      </div>
    </div>
  );
};

export default SubscriptionPage;
