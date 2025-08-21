import React, { useState, useEffect } from "react";
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
} from "@heroui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { 
  getProviderDisplayName,
  Connection, 
  CreateConnectionInput, 
  UpdateConnectionInput, 
  ProviderType,
  getProviderAuthFields,
  createAuthParams,
} from "../../types/connection";

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    input: CreateConnectionInput | UpdateConnectionInput,
  ) => Promise<boolean>;
  onTestConnection: (input: CreateConnectionInput) => Promise<boolean>;
  connection?: Connection; // If provided, this is an edit modal
  loading?: boolean;
  businessId: string;
}

interface FormData {
  name: string;
  provider: ProviderType | "";
  authFields: Record<string, string>;
  exportUrl: string;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onTestConnection,
  connection,
  loading = false,
  businessId,
}) => {
  const { t } = useTranslation();
  const isEdit = !!connection;

  const [formData, setFormData] = useState<FormData>({
    name: "",
    provider: "",
    authFields: {},
    exportUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: "success" | "error" | null;
    message: string;
  }>({ status: null, message: "" });

  // Available providers for the select dropdown
  const providers: ProviderType[] = [
    // "PostgreSQL",
    // "MySQL",
    // "SQLite",
    // "MongoDB",
    // "Redis",
    // "REST API",
    // "GraphQL API",
    // "MQTT",
    // "FTP",
    // "SFTP",
    "FootfallCamV9API",
    "Other",
  ];

  useEffect(() => {
    if (isOpen) {
      if (connection) {
        // Pre-populate form with existing connection data
        const authFields: Record<string, string> = {
          user: connection.authParams?.user || "",
          password: "", // Don't pre-fill password for security
        };

        setFormData({
          name: connection.name,
          provider: connection.provider,
          authFields,
          exportUrl: connection.exportUrl || "",
        });
      } else {
        setFormData({
          name: "",
          provider: "",
          authFields: {},
          exportUrl: "",
        });
      }
      setErrors({});
      setTestResult({ status: null, message: "" });
    }
  }, [isOpen, connection]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAuthChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      authFields: {
        ...prev.authFields,
        [field]: value,
      },
    }));
  };

  const testConnection = async () => {
    // Basic validation before testing
    const provider = formData.provider as ProviderType;
    if (!provider) {
      setTestResult({
        status: "error",
        message: t(
          "connections.testIncompleteForm",
          "Please select a provider before testing.",
        ),
      });
      return;
    }

    const requiredFields = getProviderAuthFields(provider).filter(
      (field) => field.required,
    );
    const missingFields = requiredFields.filter(
      (field) => !formData.authFields[field.key]?.trim(),
    );

    if (missingFields.length > 0) {
      setTestResult({
        status: "error",
        message: t(
          "connections.testIncompleteForm",
          "Please fill in all required fields before testing.",
        ),
      });
      return;
    }

    setTestingConnection(true);
    setTestResult({ status: null, message: "" });

    try {
      const authParams = createAuthParams(provider, formData.authFields);
      const testInput: CreateConnectionInput = {
        name: formData.name,
        provider,
        businessId: parseInt(businessId, 10),
        authParams,
        exportUrl: formData.exportUrl,
      };

      const success = await onTestConnection(testInput);

      if (success) {
        setTestResult({
          status: "success",
          message: t(
            "connections.testSuccess",
            "Connection test successful! Credentials are valid.",
          ),
        });
      } else {
        setTestResult({
          status: "error",
          message: t(
            "connections.testFailed",
            "Connection test failed. Please check your credentials.",
          ),
        });
      }
    } catch (error) {
      setTestResult({
        status: "error",
        message: t(
          "connections.testError",
          "Connection test failed due to network error.",
        ),
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t(
        "connections.nameRequired",
        "Connection name is required",
      );
    }

    if (!formData.provider) {
      newErrors.provider = t(
        "connections.providerRequired",
        "Provider is required",
      );
    }

    if (formData.provider) {
      const requiredFields = getProviderAuthFields(
        formData.provider as ProviderType,
      ).filter((field) => field.required);
      for (const field of requiredFields) {
        if (!isEdit || field.key !== "password") {
          if (!formData.authFields[field.key]?.trim()) {
            newErrors[field.key] = t(
              `connections.${field.key}Required`,
              `${field.label} is required`,
            );
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const provider = formData.provider as ProviderType;
    const authParams = createAuthParams(provider, formData.authFields);

    const submitData: CreateConnectionInput | UpdateConnectionInput = {
      name: formData.name,
      provider,
      businessId: parseInt(businessId, 10),
      authParams,
      exportUrl: formData.exportUrl,
    };
 
    const success = await onSubmit(submitData);
    if (success) {
      onClose();
    }
  };

  // Get auth fields for current provider
  const authFields = formData.provider
    ? getProviderAuthFields(formData.provider as ProviderType)
    : [];

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="md">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {isEdit
              ? t("connections.editConnection", "Edit Connection")
              : t("connections.createConnection", "Create Connection")}
          </ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label={t("connections.name", "Connection Name")}
              placeholder={t(
                "connections.namePlaceholder",
                "Enter connection name",
              )}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              isInvalid={!!errors.name}
              errorMessage={errors.name}
              isRequired
            />

            <Select
              label={t("connections.provider", "Provider")}
              placeholder={t(
                "connections.providerPlaceholder",
                "Select a provider",
              )}
              selectedKeys={formData.provider ? [formData.provider] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                handleInputChange("provider", value || "");
              }}
              isInvalid={!!errors.provider}
              errorMessage={errors.provider}
              isRequired
            >
              {providers.map((provider) => (
                <SelectItem key={provider}>
                  {getProviderDisplayName(provider)}
                </SelectItem>
              ))}
            </Select>

            {/* Dynamic auth fields based on provider */}
            {authFields.map((field) => (
              <Input
                key={field.key}
                label={t(`connections.auth.${field.key}`, field.label)}
                type={field.type}
                placeholder={
                  isEdit && field.type === "password"
                    ? t("connections.sensitiveFieldEditPlaceholder", "Leave empty to keep current value")
                    : t(`connections.auth.${field.key}Placeholder`, field.placeholder)
                }
                value={formData.authFields[field.key] || ""}
                onChange={(e) => handleAuthChange(field.key, e.target.value)}
                isInvalid={!!errors[field.key]}
                errorMessage={errors[field.key]}
                isRequired={field.required && !isEdit}
                description={
                  isEdit && field.type === "password"
                    ? t(
                        "connections.sensitiveFieldHint",
                        "This field is hidden for security. Enter a new value only if you want to change it.",
                      )
                    : undefined
                }
              />
            ))}

            {formData.provider === 'FootfallCamV9API' && (
              <Input
                label={t("connections.auth.exportUrl", "Export URL")}
                placeholder={t("connections.auth.exportUrlPlaceholder", "Enter export URL")}
                value={formData.exportUrl}
                onChange={(e) => handleInputChange("exportUrl", e.target.value)}
                isInvalid={!!errors.exportUrl}
                errorMessage={errors.exportUrl}
                isRequired
              />
            )}

            {/* Test Connection Section */}
            <div className="space-y-2">
              <Button
                variant="bordered"
                color="primary"
                onPress={testConnection}
                isLoading={testingConnection}
                isDisabled={loading}
                startContent={
                  !testingConnection && testResult.status === "success" ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : undefined
                }
                className="w-full"
              >
                {testingConnection
                  ? t("connections.testing", "Testing Connection...")
                  : t("connections.testConnection", "Test Connection")}
              </Button>

              {/* Test Result Display */}
              {testResult.status && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    testResult.status === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {testResult.status === "success" ? (
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <XMarkIcon className="h-4 w-4 text-red-600" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Requirement Notice */}
            {testResult.status !== "success" && (
              <div className="p-3 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">ℹ️</span>
                  <span>
                    {t(
                      "connections.testRequired",
                      "A successful connection test is required before saving.",
                    )}
                  </span>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="bordered" onPress={onClose} isDisabled={loading}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={loading}
              isDisabled={loading || testResult.status !== "success"}
            >
              {isEdit
                ? t("common.update", "Update")
                : t("common.create", "Create")}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ConnectionModal;
