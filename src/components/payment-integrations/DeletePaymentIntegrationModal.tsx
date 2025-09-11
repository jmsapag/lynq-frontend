import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
} from "@heroui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { PaymentIntegration } from "../../types/payment-integration";
import { getPaymentProviderMetadata } from "../../utils/payment-providers";

interface DeletePaymentIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  isLoading: boolean;
  integration: PaymentIntegration | null;
}

const DeletePaymentIntegrationModal: React.FC<
  DeletePaymentIntegrationModalProps
> = ({ isOpen, onClose, onConfirm, isLoading, integration }) => {
  const { t } = useTranslation();

  if (!integration) return null;

  const providerMetadata = getPaymentProviderMetadata(integration.provider);
  const isActive = integration.status === "active";

  const handleConfirm = async () => {
    const success = await onConfirm();
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" placement="center">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t("payments.deleteIntegrationTitle", "Eliminar Integración")}
              </h2>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            <p className="text-gray-600">
              {t(
                "payments.deleteConfirmMessage",
                "¿Estás seguro de que deseas eliminar esta integración de pagos? Esta acción no se puede deshacer.",
              )}
            </p>

            {/* Integration info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{providerMetadata.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {integration.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {providerMetadata.name}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Chip
                  color={
                    integration.status === "active" ? "success" : "default"
                  }
                  variant="flat"
                  size="sm"
                >
                  {t(
                    `payments.status.${integration.status}`,
                    integration.status,
                  )}
                </Chip>
                {integration.isTestMode && (
                  <Chip color="warning" variant="flat" size="sm">
                    {t("payments.testMode", "Modo Prueba")}
                  </Chip>
                )}
              </div>
            </div>

            {isActive && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      {t(
                        "payments.deleteActiveWarningTitle",
                        "Integración Activa",
                      )}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      {t(
                        "payments.deleteActiveWarningDesc",
                        "Esta integración está actualmente activa. Al eliminarla, se interrumpirán todos los procesos de pago asociados.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500">
              {t(
                "payments.deleteConsequences",
                "Al eliminar esta integración, se perderán todos los datos de configuración y no podrás procesarpagos a través de este proveedor hasta que configures una nueva integración.",
              )}
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isLoading}>
            {t("common.cancel", "Cancelar")}
          </Button>
          <Button color="danger" onPress={handleConfirm} isLoading={isLoading}>
            {t("payments.deleteIntegration", "Eliminar Integración")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeletePaymentIntegrationModal;
