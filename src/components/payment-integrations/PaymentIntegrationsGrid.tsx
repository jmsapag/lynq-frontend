import React from "react";
import { useTranslation } from "react-i18next";
import {
  PaymentIntegration,
  TestPaymentConnectionInput,
} from "../../types/payment-integration";
import PaymentIntegrationCard from "./PaymentIntegrationCard";
import { Spinner } from "@heroui/react";

interface PaymentIntegrationsGridProps {
  integrations: PaymentIntegration[];
  loading: boolean;
  onEdit: (integration: PaymentIntegration) => void;
  onDelete: (integration: PaymentIntegration) => void;
  onToggleStatus: (integration: PaymentIntegration) => void;
  isToggling: number | null;
  onTestConnection: (
    input: TestPaymentConnectionInput,
  ) => Promise<{ success: boolean; message: string }>;
}

const PaymentIntegrationsGrid: React.FC<PaymentIntegrationsGridProps> = ({
  integrations,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling,
  onTestConnection,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (integrations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {t("payments.noIntegrations", "No hay integraciones configuradas")}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t(
            "payments.getStarted",
            "Comienza agregando tu primera integración de pagos.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {integrations.map((integration) => (
        <PaymentIntegrationCard
          key={integration.id}
          integration={integration}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          isToggling={isToggling === integration.id}
          onTestConnection={onTestConnection}
        />
      ))}
    </div>
  );
};

export default PaymentIntegrationsGrid;
