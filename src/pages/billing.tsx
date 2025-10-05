import { useEffect, useMemo, useState, type SVGProps } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Chip,
} from "@heroui/react";
import {
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SignalIcon,
  ClockIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import {
  getSubscriptionStatus,
  getManualSubscription,
} from "../services/subscriptionService";
import {
  GetSubscriptionResponse,
  SubscriptionStatus,
  PricingInfo,
  ManualSubscriptionResponse,
  ManualSubscriptionStatus,
} from "../types/subscription";
import { useNavigate } from "react-router-dom";
import InvoiceUpload from "../components/payments/InvoiceUpload";
import { getBusinessIdFromToken } from "../hooks/auth/useAuth";

const getStatusColor = (status: SubscriptionStatus) => {
  switch (status) {
    case "active":
    case "trialing":
      return "success";
    case "past_due":
      return "warning";
    case "unpaid":
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
      return "danger";
    case "paused":
      return "default";
    default:
      return "default";
  }
};

const getManualStatusColor = (status: ManualSubscriptionStatus) => {
  switch (status) {
    case "active":
      return "success";
    case "pending_approval":
      return "warning";
    case "payment_due":
      return "default";
    case "blocked":
      return "danger";
    default:
      return "default";
  }
};

const calculateTieredPrice = (
  sensorQty: number,
  pricing: PricingInfo | null,
): number => {
  if (!pricing) return 0;

  // Handle per-unit billing
  if (pricing.billingScheme === "per_unit" && pricing.unitAmount) {
    return (pricing.unitAmount * sensorQty) / 100;
  }

  // Handle tiered/graduated billing
  if (pricing.billingScheme === "tiered" && pricing.tiers) {
    // this is volume pricing, so find the tier that matches the current sensorQty
    const currentTier = pricing.tiers.find((tier) => {
      const prevTierIndex = pricing.tiers!.indexOf(tier) - 1;
      const prevLimit =
        prevTierIndex >= 0 ? pricing.tiers![prevTierIndex].up_to || 0 : 0;
      return (
        sensorQty > prevLimit &&
        (tier.up_to === null || sensorQty <= tier.up_to)
      );
    });

    if (currentTier) {
      return (currentTier.unit_amount * sensorQty) / 100;
    }
  }

  return 0;
};

type InfoRowProps = {
  icon: React.ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  helper?: string | null;
};

const InfoRow = ({ icon: Icon, label, value, helper }: InfoRowProps) => (
  <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-900">{value}</p>
      {helper ? <p className="mt-1 text-xs text-gray-400">{helper}</p> : null}
    </div>
  </div>
);

export default function BillingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const businessId = getBusinessIdFromToken();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] =
    useState<GetSubscriptionResponse | null>(null);
  const [manualSubscription, setManualSubscription] =
    useState<ManualSubscriptionResponse | null>(null);

  const fetchData = async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      setError(null);

      // Try to fetch manual subscription first
      try {
        const manualData = await getManualSubscription(Number(businessId));
        setManualSubscription(manualData);
        setSubscription(null); // Manual subscription takes precedence
      } catch (manualErr: any) {
        // If no manual subscription (404), try Stripe
        if (manualErr?.response?.status === 404) {
          const stripeData = await getSubscriptionStatus();
          setSubscription(stripeData);
          setManualSubscription(null);
        } else {
          throw manualErr;
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || t("billing.errorLoading"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [t, businessId]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language || "en", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 2,
      }),
    [i18n.language],
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language || "en", {
        dateStyle: "medium",
      }),
    [i18n.language],
  );

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(i18n.language || "en"),
    [i18n.language],
  );

  const handleCreateSubscription = () => {
    navigate("/billing/subscription");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-danger-600">{error}</p>
        <Button color="primary" onPress={() => window.location.reload()}>
          {t("billing.retry")}
        </Button>
      </div>
    );
  }

  // Render manual subscription view
  if (manualSubscription && businessId) {
    const formatDate = (dateString: string | null) => {
      if (!dateString) return t("billing.notAvailable");
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return t("billing.notAvailable");
      return dateFormatter.format(date);
    };

    const statusValue = t(`billing.manualStatus.${manualSubscription.status}`);
    const formattedAmount = currencyFormatter.format(
      manualSubscription.priceAmount,
    );

    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t("billing.title")}</h1>
          <p className="text-base text-gray-500">
            {t("billing.manualSubscriptionSubtitle")}
          </p>
        </div>

        {manualSubscription.status === "blocked" && (
          <Card className="border-2 border-danger-400/70 bg-danger-50 shadow-sm">
            <CardBody className="p-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-danger-700">
                  {t("billing.blockedWarning.title")}
                </h3>
                <p className="mt-2 text-sm text-danger-700">
                  {t("billing.blockedWarning.description")}
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {manualSubscription.status === "payment_due" && (
          <Card className="border-2 border-warning-400/70 bg-warning-50 shadow-sm">
            <CardBody className="p-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-warning-700">
                  {t("billing.paymentDueWarning.title")}
                </h3>
                <p className="mt-2 text-sm text-warning-700">
                  {t("billing.paymentDueWarning.description")}
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        <Card className="overflow-hidden border border-primary-100 shadow-none">
          <CardBody className="p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip
                    color={getManualStatusColor(manualSubscription.status)}
                    variant="flat"
                  >
                    {statusValue}
                  </Chip>
                  <Chip color="primary" variant="flat">
                    {t("billing.manualAgreement")}
                  </Chip>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-primary-600">
                    {t("billing.summaryTitle")}
                  </p>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {t("billing.manualSummarySubtitle")}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {t("billing.manualSummaryDescription")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <span className="text-sm text-gray-500">
                  {t("billing.summary.amountLabel")}
                </span>
                <span className="text-3xl font-bold text-foreground">
                  {formattedAmount}
                </span>
                <p className="text-xs text-gray-500">{t("billing.preTax")}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    color="primary"
                    variant="solid"
                    onPress={handleCreateSubscription}
                  >
                    {t("billing.manageSubscription")}
                  </Button>
                  <Button
                    color="primary"
                    variant="bordered"
                    onPress={() => navigate("/new-payment-method")}
                    startContent={<CreditCardIcon className="h-5 w-5" />}
                  >
                    {t("billing.addPaymentMethod")}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InfoRow
                icon={CalendarDaysIcon}
                label={t("billing.manual.nextPaymentDate")}
                value={formatDate(manualSubscription.nextExpirationDate)}
              />
              <InfoRow
                icon={ShieldCheckIcon}
                label={t("billing.summary.statusLabel")}
                value={statusValue}
              />
            </div>
          </CardBody>
        </Card>

        <InvoiceUpload
          businessId={Number(businessId)}
          currentInvoiceFileName={manualSubscription.invoiceFileName}
          currentInvoiceUploadedAt={manualSubscription.invoiceUploadedAt}
          onUploadSuccess={fetchData}
        />
      </div>
    );
  }

  if (!subscription || "message" in subscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="flex flex-col gap-2 p-6">
            <h1 className="text-2xl font-bold">{t("billing.title")}</h1>
          </CardHeader>
          <CardBody className="p-6 flex flex-col gap-4">
            <p className="text-gray-600">{t("billing.noSubscription")}</p>
            <Button color="primary" onPress={handleCreateSubscription}>
              {t("billing.createSubscription")}
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("billing.notAvailable");
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return t("billing.notAvailable");
    return dateFormatter.format(date);
  };

  const showPastDueWarning = subscription.status === "past_due";
  const showUnpaidWarning = subscription.status === "unpaid";

  const sensorQty = subscription["sensor-qty"];
  const calculatedAmount =
    sensorQty !== null && sensorQty !== undefined
      ? calculateTieredPrice(sensorQty, subscription.pricing)
      : null;
  const hasCalculatedAmount =
    typeof calculatedAmount === "number" && calculatedAmount > 0;

  const displayedAmountRaw =
    hasCalculatedAmount && calculatedAmount !== null
      ? calculatedAmount
      : typeof subscription["amount/month"] === "number"
        ? subscription["amount/month"]
        : null;

  const formattedDisplayedAmount =
    displayedAmountRaw !== null
      ? currencyFormatter.format(displayedAmountRaw)
      : t("billing.notAvailable");

  const formattedCalculatedAmount =
    hasCalculatedAmount && calculatedAmount !== null
      ? currencyFormatter.format(calculatedAmount)
      : null;

  const formattedMonthlyAmount =
    typeof subscription["amount/month"] === "number"
      ? currencyFormatter.format(subscription["amount/month"])
      : null;

  const periodStart = subscription.currentPeriodStart
    ? formatDate(subscription.currentPeriodStart)
    : subscription.trialStart
      ? formatDate(subscription.trialStart)
      : t("billing.notAvailable");

  const periodEnd = subscription.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : subscription.trialEnd
      ? formatDate(subscription.trialEnd)
      : t("billing.notAvailable");

  const summaryNextHelper = subscription.currentPeriodEnd
    ? t("billing.summary.nextBillingHelper")
    : null;

  const cancelHelper =
    subscription.cancelAtPeriodEnd === null
      ? null
      : subscription.cancelAtPeriodEnd
        ? t("billing.cancelAtPeriodEndHelper")
        : t("billing.cancelAtPeriodEndActive");

  const schemeLabel = subscription.pricing
    ? t(`billing.schemeLabel.${subscription.pricing.billingScheme}`, {
        defaultValue: subscription.pricing.billingScheme,
      })
    : null;

  const sensorsValue =
    sensorQty !== null
      ? numberFormatter.format(sensorQty)
      : t("billing.notAvailable");

  const sensorsHelper =
    sensorQty !== null
      ? t("billing.summary.sensorHelper", { count: sensorQty })
      : null;

  const statusValue = t(`billing.status.${subscription.status}`);

  const manageButtonLabel =
    subscription.status === "canceled"
      ? t("billing.createNewSubscription")
      : t("billing.manageSubscription");

  const tiers = subscription.pricing?.tiers ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-0">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t("billing.title")}</h1>
        <p className="text-base text-gray-500">{t("billing.subtitle")}</p>
      </div>

      {showPastDueWarning && (
        <Card className="border-2 border-warning-400/70 bg-warning-50 shadow-sm">
          <CardBody className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-warning-700">
                  {t("billing.pastDueWarning.title")}
                </h3>
                <p className="mt-2 text-sm text-warning-700">
                  {t("billing.pastDueWarning.description")}
                </p>
              </div>
              <Button
                color="warning"
                variant="flat"
                onPress={handleCreateSubscription}
              >
                {t("billing.manageSubscription")}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {showUnpaidWarning && (
        <Card className="border-2 border-danger-400/70 bg-danger-50 shadow-sm">
          <CardBody className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-danger-700">
                  {t("billing.unpaidWarning.title")}
                </h3>
                <p className="mt-2 text-sm text-danger-700">
                  {t("billing.unpaidWarning.description")}
                </p>
              </div>
              <Button color="danger" onPress={handleCreateSubscription}>
                {t("billing.manageSubscription")}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="overflow-hidden border border-primary-100 shadow-none">
        <CardBody className="p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  color={getStatusColor(subscription.status)}
                  variant="flat"
                >
                  {statusValue}
                </Chip>
                {schemeLabel ? (
                  <Chip color="primary" variant="flat">
                    {schemeLabel}
                  </Chip>
                ) : null}
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-primary-600">
                  {t("billing.summaryTitle")}
                </p>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {t("billing.summarySubtitle")}
                </h2>
                <p className="text-sm text-gray-500">
                  {t("billing.summaryDescription")}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <span className="text-sm text-gray-500">
                {t("billing.summary.amountLabel")}
              </span>
              <span className="text-3xl font-bold text-foreground">
                {formattedDisplayedAmount}
              </span>
              <p className="text-xs text-gray-500">{t("billing.preTax")}</p>
              <Button
                color="primary"
                variant="solid"
                onPress={handleCreateSubscription}
              >
                {manageButtonLabel}
              </Button>
              <Button
                color="primary"
                variant="bordered"
                onPress={() => navigate("/new-payment-method")}
              >
                {t("billing.addPaymentMethod")}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoRow
              icon={CalendarDaysIcon}
              label={t("billing.summary.nextBilling")}
              value={periodEnd}
              helper={summaryNextHelper}
            />
            <InfoRow
              icon={SignalIcon}
              label={t("billing.summary.sensorsLabel")}
              value={sensorsValue}
              helper={sensorsHelper}
            />
            <InfoRow
              icon={ShieldCheckIcon}
              label={t("billing.summary.statusLabel")}
              value={statusValue}
              helper={cancelHelper}
            />
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="flex flex-col gap-2 p-6">
            <h2 className="text-xl font-semibold">
              {t("billing.subscriptionDetails")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("billing.detailsDescription")}
            </p>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {formattedMonthlyAmount ? (
                <InfoRow
                  icon={CurrencyDollarIcon}
                  label={t("billing.monthlyAmount")}
                  value={formattedMonthlyAmount}
                  helper={t("billing.monthlyAmountHint")}
                />
              ) : null}
              {formattedCalculatedAmount ? (
                <InfoRow
                  icon={ReceiptPercentIcon}
                  label={t("billing.calculatedPrice")}
                  value={formattedCalculatedAmount}
                  helper={t("billing.calculatedPriceHint")}
                />
              ) : null}
              <InfoRow
                icon={ClockIcon}
                label={t("billing.currentPeriodStart")}
                value={periodStart}
              />
              <InfoRow
                icon={CalendarDaysIcon}
                label={t("billing.currentPeriodEnd")}
                value={periodEnd}
              />
              {subscription.cancelAtPeriodEnd !== null ? (
                <InfoRow
                  icon={ShieldExclamationIcon}
                  label={t("billing.cancelAtPeriodEnd")}
                  value={
                    subscription.cancelAtPeriodEnd
                      ? t("billing.yes")
                      : t("billing.no")
                  }
                  helper={cancelHelper}
                />
              ) : null}
            </div>
          </CardBody>
        </Card>

        {subscription.pricing && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-col gap-2 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">
                  {t("billing.pricingModel")}
                </h2>
                {schemeLabel ? (
                  <Chip size="sm" color="primary" variant="flat">
                    {schemeLabel}
                  </Chip>
                ) : null}
              </div>
              <p className="text-sm text-gray-500">
                {t("billing.pricingHint")}
              </p>
            </CardHeader>
            <CardBody className="p-6">
              {tiers.length > 0 ? (
                <div className="space-y-3">
                  {tiers.map((tier, index) => {
                    const prevTier = index === 0 ? undefined : tiers[index - 1];
                    const prevLimit = prevTier?.up_to ?? 0;
                    const currentLimit = tier.up_to;
                    const pricePerUnit = currencyFormatter.format(
                      tier.unit_amount / 100,
                    );
                    const rangeLabel =
                      currentLimit === null
                        ? t("billing.tierUnlimited", { from: prevLimit + 1 })
                        : t("billing.tierRange", {
                            from: prevLimit + 1,
                            to: currentLimit,
                          });
                    const tierLabel = t("billing.tierLabel", {
                      index: index + 1,
                    });

                    return (
                      <div
                        key={`${tier.up_to ?? "infinity"}-${index}`}
                        className="flex animate-all duration-300 items-center justify-between rounded-xl  border border-primary-100 p-4"
                      >
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                            {tierLabel}
                          </span>
                          <p className="text-sm text-gray-600">{rangeLabel}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-semibold text-foreground ">
                            {pricePerUnit}
                            {t("billing.perSensor")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {t("billing.pricingEmpty")}
                </p>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      {subscription.status === "canceled" && (
        <Card className="border border-danger-200 bg-danger-50/60 shadow-sm">
          <CardBody className="flex flex-col gap-4 p-6">
            <h3 className="text-lg font-semibold text-danger-700">
              {t("billing.reactivateSubscription")}
            </h3>
            <p className="text-sm text-danger-600">
              {t("billing.reactivateDescription")}
            </p>
            <Button color="primary" onPress={handleCreateSubscription}>
              {t("billing.createNewSubscription")}
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
