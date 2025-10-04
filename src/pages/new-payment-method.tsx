import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  addToast,
} from "@heroui/react";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { getStripe } from "../config/stripe";
import { usePaymentMethod } from "../hooks/payments/usePayementMethod.ts";

const stripePromise = getStripe();

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#18181b",
      fontFamily: "system-ui, sans-serif",
      fontSize: "16px",
      "::placeholder": {
        color: "#71717a",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

const PaymentMethodForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { createSetupIntent, loading: setupLoading } = usePaymentMethod();

  const [cardholderName, setCardholderName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setFormError(t("payment.stripeNotLoaded"));
      return;
    }

    if (!cardholderName.trim()) {
      setFormError(t("payment.cardholderNameRequired"));
      return;
    }

    setProcessing(true);
    setFormError(null);

    try {
      // Step 1: Create SetupIntent on backend
      const setupIntent = await createSetupIntent();
      if (!setupIntent) {
        throw new Error(t("payment.setupIntentFailed"));
      }

      // Step 2: Confirm card setup with Stripe
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        throw new Error(t("payment.cardElementNotFound"));
      }

      const { setupIntent: confirmedSetupIntent, error } =
        await stripe.confirmCardSetup(setupIntent.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName,
            },
          },
        });

      if (error) {
        throw new Error(error.message || t("payment.cardSetupFailed"));
      }

      if (confirmedSetupIntent?.status === "succeeded") {
        addToast({
          title: t("toasts.createSuccessTitle"),
          description: t("toasts.createSuccessDescription"),
          severity: "success",
          color: "success",
        });
        navigate("/billing");
      } else {
        throw new Error(t("payment.unexpectedStatus"));
      }
    } catch (err: any) {
      setFormError(err.message || t("payment.genericError"));
      addToast({
        title: t("toasts.createFailedTitle"),
        description: t("toasts.createFailedDescription"),
        severity: "danger",
        color: "danger",
      });
    } finally {
      setProcessing(false);
    }
  };

  const isLoading = processing || setupLoading || !stripe;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{t("payment.addNewCard")}</h1>
          <p className="text-base text-gray-500">
            {t("payment.addNewCardSubtitle")}
          </p>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-col gap-2 p-6">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold">
              {t("payment.cardDetails")}
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            {t("payment.cardDetailsDescription")}
          </p>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="rounded-lg bg-danger-50 p-4 text-sm text-danger-700">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t("payment.cardholderName")}
                </label>
                <Input
                  type="text"
                  placeholder={t("payment.cardholderNamePlaceholder")}
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  isRequired
                  isDisabled={isLoading}
                  classNames={{
                    input: "text-base",
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t("payment.cardNumber")}
                </label>
                <div className="rounded-lg border border-gray-300 p-3 transition-colors focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200">
                  <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("payment.expiryDate")}
                  </label>
                  <div className="rounded-lg border border-gray-300 p-3 transition-colors focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200">
                    <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t("payment.cvc")}
                  </label>
                  <div className="rounded-lg border border-gray-300 p-3 transition-colors focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200">
                    <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="flat"
                onPress={() => navigate("/billing")}
                isDisabled={isLoading}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={isLoading}
                startContent={
                  !isLoading && <CreditCardIcon className="h-5 w-5" />
                }
              >
                {isLoading ? t("payment.processing") : t("payment.addCard")}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="border border-primary-100 bg-primary-50/50">
        <CardBody className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
              <CreditCardIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary-900">
                {t("payment.securePayment")}
              </p>
              <p className="text-xs text-primary-700">
                {t("payment.securePaymentDescription")}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default function NewPaymentMethodPage() {
  if (!stripePromise) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-danger-600">
            Stripe is not configured. Please check your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentMethodForm />
    </Elements>
  );
}
