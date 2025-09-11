import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from "@heroui/react";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  PaymentIntegration,
  TestPaymentConnectionInput,
} from "../../types/payment-integration";
import { getPaymentProviderMetadata } from "../../utils/payment-providers";
import { addToast } from "@heroui/react";

interface PaymentIntegrationCardProps {
  integration: PaymentIntegration;
  onEdit: (integration: PaymentIntegration) => void;
  onDelete: (integration: PaymentIntegration) => void;
  onToggleStatus: (integration: PaymentIntegration) => void;
  isToggling: boolean;
  onTestConnection: (
    input: TestPaymentConnectionInput,
  ) => Promise<{ success: boolean; message: string }>;
}

const PaymentIntegrationCard: React.FC<PaymentIntegrationCardProps> = ({
  integration,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling,
  onTestConnection,
}) => {
  const { t } = useTranslation();
  const [isTesting, setIsTesting] = useState(false);
  const providerMetadata = getPaymentProviderMetadata(integration.provider);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "error":
        return "danger";
      case "testing":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "inactive":
        return <PauseIcon className="h-4 w-4" />;
      case "error":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case "testing":
        return <ClockIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const testInput: TestPaymentConnectionInput = {
        provider: integration.provider,
        config: integration.config,
        businessId: integration.businessId,
      };

      const result = await onTestConnection(testInput);

      addToast({
        title: result.success
          ? t("payments.testSuccessTitle", "Conexión exitosa")
          : t("payments.testFailTitle", "Error de conexión"),
        description: result.message,
        color: result.success ? "success" : "danger",
      });
    } catch (error) {
      addToast({
        title: t("payments.testErrorTitle", "Error al probar conexión"),
        description:
          error instanceof Error
            ? error.message
            : t("payments.testErrorDesc", "No se pudo probar la conexión"),
        color: "danger",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const formatLastTested = (lastTestedAt?: string) => {
    if (!lastTestedAt) return t("payments.neverTested", "Nunca probado");

    const date = new Date(lastTestedAt);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return t("payments.testedJustNow", "Hace un momento");
    if (diffInHours < 24)
      return t("payments.testedHoursAgo", "Hace {{hours}} horas", {
        hours: diffInHours,
      });

    const diffInDays = Math.floor(diffInHours / 24);
    return t("payments.testedDaysAgo", "Hace {{days}} días", {
      days: diffInDays,
    });
  };

  return (
    <Card className="w-full">
      <CardBody className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{providerMetadata.icon}</div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 truncate">
                {integration.name}
              </h3>
              <p className="text-xs text-gray-500">{providerMetadata.name}</p>
            </div>
          </div>

          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="text-gray-400"
              >
                <EllipsisVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key="edit"
                startContent={<PencilIcon className="h-4 w-4" />}
                onPress={() => onEdit(integration)}
              >
                {t("common.edit", "Editar")}
              </DropdownItem>
              <DropdownItem
                key="toggle"
                startContent={
                  integration.status === "active" ? (
                    <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )
                }
                onPress={() => onToggleStatus(integration)}
                isDisabled={isToggling}
              >
                {integration.status === "active"
                  ? t("payments.deactivate", "Desactivar")
                  : t("payments.activate", "Activar")}
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<TrashIcon className="h-4 w-4" />}
                onPress={() => onDelete(integration)}
              >
                {t("common.delete", "Eliminar")}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Chip
              color={getStatusColor(integration.status)}
              variant="flat"
              size="sm"
              startContent={getStatusIcon(integration.status)}
            >
              {t(`payments.status.${integration.status}`, integration.status)}
            </Chip>
            {integration.isTestMode && (
              <Chip color="warning" variant="flat" size="sm">
                {t("payments.testMode", "Modo Prueba")}
              </Chip>
            )}
          </div>

          {integration.testResults && (
            <div className="text-xs text-gray-500">
              <div className="flex items-center gap-2">
                {integration.testResults.success ? (
                  <CheckCircleIcon className="h-3 w-3 text-green-500" />
                ) : (
                  <ExclamationTriangleIcon className="h-3 w-3 text-red-500" />
                )}
                <span>{formatLastTested(integration.lastTestedAt)}</span>
              </div>
              {!integration.testResults.success && (
                <p className="mt-1 text-red-600">
                  {integration.testResults.message}
                </p>
              )}
            </div>
          )}

          {providerMetadata.testingSupported && (
            <Button
              size="sm"
              variant="bordered"
              onPress={handleTestConnection}
              isLoading={isTesting}
              disabled={isTesting}
              className="w-full"
            >
              {isTesting ? (
                <Spinner size="sm" />
              ) : (
                t("payments.testConnection", "Probar Conexión")
              )}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default PaymentIntegrationCard;
