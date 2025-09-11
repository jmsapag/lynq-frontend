import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  Link,
} from "@heroui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import {
  PaymentIntegration,
  CreatePaymentIntegrationInput,
  UpdatePaymentIntegrationInput,
  PaymentProviderType,
} from "../../types/payment-integration";
import {
  getAllPaymentProviders,
  getPaymentProviderMetadata,
} from "../../utils/payment-providers";

interface PaymentIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    input: CreatePaymentIntegrationInput | UpdatePaymentIntegrationInput,
  ) => Promise<boolean>;
  isLoading: boolean;
  mode: "create" | "edit";
  businessId: number;
  integration?: PaymentIntegration | null;
}

const PaymentIntegrationModal: React.FC<PaymentIntegrationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  mode,
  businessId,
  integration,
}) => {
  const { t } = useTranslation();
  const [selectedProvider, setSelectedProvider] =
    useState<PaymentProviderType>("mercadopago");
  const [name, setName] = useState("");
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isTestMode, setIsTestMode] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );

  const providers = getAllPaymentProviders();
  const currentProviderMetadata = getPaymentProviderMetadata(selectedProvider);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && integration) {
        setSelectedProvider(integration.provider);
        setName(integration.name);
        setConfig(integration.config || {});
        setIsTestMode(integration.isTestMode);
      } else {
        setSelectedProvider("mercadopago");
        setName("");
        setConfig({});
        setIsTestMode(false);
      }
      setShowPasswords({});
    }
  }, [isOpen, mode, integration]);

  const handleProviderChange = (provider: PaymentProviderType) => {
    setSelectedProvider(provider);
    setConfig({}); // Reset config when changing provider
  };

  const handleConfigChange = (field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async () => {
    const input =
      mode === "create"
        ? ({
            provider: selectedProvider,
            name,
            config: {
              ...config,
              testMode: isTestMode,
            },
            businessId,
            isTestMode,
          } as CreatePaymentIntegrationInput)
        : ({
            name,
            config: {
              ...config,
              testMode: isTestMode,
            },
            isTestMode,
          } as UpdatePaymentIntegrationInput);

    const success = await onSubmit(input);
    if (success) {
      onClose();
    }
  };

  const isFormValid = () => {
    if (!name.trim()) return false;

    const requiredFields = currentProviderMetadata.requiredFields.filter(
      (field) => field.required,
    );
    return requiredFields.every((field) => {
      const value = config[field.field];
      return value && String(value).trim();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
      placement="center"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">
            {mode === "create"
              ? t("payments.createIntegration", "Nueva Integración de Pagos")
              : t("payments.editIntegration", "Editar Integración de Pagos")}
          </h2>
          <p className="text-sm text-gray-500">
            {mode === "create"
              ? t(
                  "payments.createIntegrationDesc",
                  "Configura una nueva integración con un proveedor de pagos",
                )
              : t(
                  "payments.editIntegrationDesc",
                  "Actualiza la configuración de la integración",
                )}
          </p>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {/* Provider Selection (only in create mode) */}
          {mode === "create" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("payments.provider", "Proveedor")}
              </label>
              <Select
                placeholder={t(
                  "payments.selectProvider",
                  "Selecciona un proveedor",
                )}
                selectedKeys={[selectedProvider]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as PaymentProviderType;
                  handleProviderChange(selected);
                }}
              >
                {providers.map((provider) => (
                  <SelectItem
                    key={provider.type}
                    startContent={
                      <span className="text-lg">{provider.icon}</span>
                    }
                  >
                    {provider.name}
                  </SelectItem>
                ))}
              </Select>
              {currentProviderMetadata.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {currentProviderMetadata.description}
                </p>
              )}
            </div>
          )}

          {/* Integration Name */}
          <Input
            label={t("payments.integrationName", "Nombre de la Integración")}
            placeholder={t(
              "payments.integrationNamePlaceholder",
              "Ej: MercadoPago Producción",
            )}
            value={name}
            onChange={(e) => setName(e.target.value)}
            isRequired
          />

          {/* Provider-specific configuration fields */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {t(
                  "payments.providerConfiguration",
                  "Configuración del Proveedor",
                )}
              </h3>

              {currentProviderMetadata.requiredFields.map((field) => (
                <div key={field.field} className="mb-4">
                  {field.type === "select" ? (
                    <Select
                      label={field.label}
                      placeholder={field.placeholder}
                      selectedKeys={
                        config[field.field] ? [config[field.field]] : []
                      }
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0];
                        handleConfigChange(field.field, selected);
                      }}
                      isRequired={field.required}
                    >
                      {field.options?.map((option) => (
                        <SelectItem key={option.value}>
                          {option.label}
                        </SelectItem>
                      )) || []}
                    </Select>
                  ) : (
                    <Input
                      label={field.label}
                      placeholder={field.placeholder}
                      value={config[field.field] || ""}
                      onChange={(e) =>
                        handleConfigChange(field.field, e.target.value)
                      }
                      type={
                        field.type === "password" && !showPasswords[field.field]
                          ? "password"
                          : "text"
                      }
                      isRequired={field.required}
                      endContent={
                        field.type === "password" ? (
                          <button
                            className="focus:outline-none"
                            type="button"
                            onClick={() =>
                              togglePasswordVisibility(field.field)
                            }
                          >
                            {showPasswords[field.field] ? (
                              <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        ) : undefined
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Test Mode Toggle */}
          <div className="flex items-center gap-3">
            <Switch isSelected={isTestMode} onValueChange={setIsTestMode}>
              <span className="text-sm">
                {t("payments.enableTestMode", "Modo de Prueba")}
              </span>
            </Switch>
          </div>

          {isTestMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                {t(
                  "payments.testModeWarning",
                  "En modo de prueba, no se procesarán pagos reales. Ideal para desarrollo y testing.",
                )}
              </p>
            </div>
          )}

          {/* Documentation Link */}
          {currentProviderMetadata.documentationUrl && (
            <div className="text-sm">
              <Link
                href={currentProviderMetadata.documentationUrl}
                target="_blank"
                className="text-primary"
              >
                {t(
                  "payments.viewDocumentation",
                  "Ver documentación del proveedor",
                )}{" "}
                →
              </Link>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {t("common.cancel", "Cancelar")}
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!isFormValid()}
          >
            {mode === "create"
              ? t("payments.createIntegration", "Crear Integración")
              : t("payments.updateIntegration", "Actualizar Integración")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PaymentIntegrationModal;
