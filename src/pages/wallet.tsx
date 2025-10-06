import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  addToast,
} from "@heroui/react";
import {
  CreditCardIcon,
  TrashIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { usePaymentMethods } from "../hooks/payments/usePaymentMethods";

export default function WalletPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { paymentMethods, loading, error, remove, refresh, setDefault } =
    usePaymentMethods();

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await remove(id);
        addToast({
          title: t("toasts.successTitle"),
          description: t("connections.deleteSuccessDesc"),
          color: "success",
          severity: "success",
        });
      } catch (err: any) {
        addToast({
          title: t("toasts.errorTitle"),
          description: err?.message || t("connections.deleteError"),
          color: "danger",
          severity: "danger",
        });
      }
    },
    [remove, t],
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("wallet.title", "Wallet")}
          </h1>
          <p className="text-sm text-gray-500">
            {t("wallet.subtitle", "Manage your saved cards")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="solid"
            startContent={<CreditCardIcon className="h-5 w-5" />}
            onPress={() => navigate("/new-payment-method")}
          >
            {t("payment.addNewCard", "Add New Payment Method")}
          </Button>
          <Button variant="bordered" onPress={refresh}>
            {t("common.refresh", "Refresh")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <WalletIcon className="h-5 w-5 text-gray-500" />
          <div className="flex flex-col">
            <span className="text-base font-medium">
              {t("wallet.methods", "Payment Methods")}
            </span>
            <span className="text-xs text-gray-500">
              {t("wallet.methodsSubtitle", "Cards saved to your account")}
            </span>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex min-h-[120px] items-center justify-center">
              <Spinner label={t("common.loading", "Loading...")} />
            </div>
          ) : error ? (
            <div className="rounded-md border border-danger-200 bg-danger-50 p-4 text-danger-700">
              {error}
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 text-center text-gray-500">
              <CreditCardIcon className="h-6 w-6" />
              <p>{t("wallet.empty", "No cards saved yet.")}</p>
              <Button
                color="primary"
                onPress={() => navigate("/new-payment-method")}
              >
                {t("payment.addNewCard")}
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {paymentMethods.map((pm) => (
                <li
                  key={pm.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <CreditCardIcon className="h-5 w-5 text-gray-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium uppercase">
                        {pm.cardBrand || "CARD"} •••• {pm.cardLast4}
                      </span>
                      <span className="text-xs text-gray-500">
                        {t("wallet.expires", "Expires")}{" "}
                        {pm.expMonth !== null && pm.expMonth !== undefined
                          ? pm.expMonth.toString().padStart(2, "0")
                          : "--"}
                        /{pm.expYear ?? "----"}
                      </span>
                    </div>
                    {pm.isDefault ? (
                      <Chip color="primary" size="sm" variant="flat">
                        {t("wallet.default", "Default")}
                      </Chip>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {!pm.isDefault && (
                      <Button
                        variant="bordered"
                        onPress={() => setDefault(pm.id)}
                      >
                        {t("wallet.setDefault", "Set default")}
                      </Button>
                    )}
                    <Button
                      color="danger"
                      variant="light"
                      startContent={<TrashIcon className="h-5 w-5" />}
                      onPress={() => handleDelete(pm.id)}
                    >
                      {t("common.delete")}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
