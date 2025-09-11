import { useState } from "react";
import { Button } from "@heroui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { addToast } from "@heroui/react";
import { usePaymentIntegrations } from "../hooks/usePaymentIntegrations";
import {
  PaymentIntegration,
  CreatePaymentIntegrationInput,
  UpdatePaymentIntegrationInput,
} from "../types/payment-integration";
import PaymentIntegrationsGrid from "../components/payment-integrations/PaymentIntegrationsGrid";
import PaymentIntegrationModal from "../components/payment-integrations/PaymentIntegrationModal";
import DeletePaymentIntegrationModal from "../components/payment-integrations/DeletePaymentIntegrationModal";
import { useSelfUserProfile } from "../hooks/users/useSelfUserProfile";

export default function PaymentIntegrationsPage() {
  const { t } = useTranslation();
  const { user } = useSelfUserProfile();

  // Default to business ID 1 for demo purposes, in real app this would come from context/route
  const businessId = user?.business_id ? String(user.business_id) : "1";

  const {
    integrations,
    loading,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testConnection,
    activateIntegration,
    deactivateIntegration,
  } = usePaymentIntegrations(businessId);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<PaymentIntegration | null>(null);

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState<number | null>(null);

  const handleCreate = async (
    input: CreatePaymentIntegrationInput | UpdatePaymentIntegrationInput,
  ): Promise<boolean> => {
    const createInput = input as CreatePaymentIntegrationInput;
    setIsCreating(true);
    try {
      const result = await createIntegration(createInput);
      if (result) {
        addToast({
          title: t("payments.integrationCreatedTitle", "Integración creada"),
          description: t(
            "payments.integrationCreatedDesc",
            "La integración de pagos ha sido creada exitosamente",
          ),
          color: "success",
        });
        setIsCreateModalOpen(false);
        return true;
      }
      return false;
    } catch (error) {
      addToast({
        title: t("payments.createErrorTitle", "Error al crear integración"),
        description:
          error instanceof Error
            ? error.message
            : t("payments.createErrorDesc", "No se pudo crear la integración"),
        color: "danger",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (
    input: CreatePaymentIntegrationInput | UpdatePaymentIntegrationInput,
  ): Promise<boolean> => {
    if (!selectedIntegration) return false;

    const updateInput = input as UpdatePaymentIntegrationInput;
    setIsUpdating(true);
    try {
      const result = await updateIntegration(
        selectedIntegration.id,
        updateInput,
      );
      if (result) {
        addToast({
          title: t(
            "payments.integrationUpdatedTitle",
            "Integración actualizada",
          ),
          description: t(
            "payments.integrationUpdatedDesc",
            "La integración de pagos ha sido actualizada exitosamente",
          ),
          color: "success",
        });
        setIsEditModalOpen(false);
        setSelectedIntegration(null);
        return true;
      }
      return false;
    } catch (error) {
      addToast({
        title: t(
          "payments.updateErrorTitle",
          "Error al actualizar integración",
        ),
        description:
          error instanceof Error
            ? error.message
            : t(
                "payments.updateErrorDesc",
                "No se pudo actualizar la integración",
              ),
        color: "danger",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (): Promise<boolean> => {
    if (!selectedIntegration) return false;

    setIsDeleting(true);
    try {
      await deleteIntegration(selectedIntegration.id);
      addToast({
        title: t("payments.integrationDeletedTitle", "Integración eliminada"),
        description: t(
          "payments.integrationDeletedDesc",
          "La integración de pagos ha sido eliminada exitosamente",
        ),
        color: "success",
      });
      setIsDeleteModalOpen(false);
      setSelectedIntegration(null);
      return true;
    } catch (error) {
      addToast({
        title: t("payments.deleteErrorTitle", "Error al eliminar integración"),
        description:
          error instanceof Error
            ? error.message
            : t(
                "payments.deleteErrorDesc",
                "No se pudo eliminar la integración",
              ),
        color: "danger",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (integration: PaymentIntegration) => {
    setIsToggling(integration.id);
    try {
      const isActive = integration.status === "active";
      const result = isActive
        ? await deactivateIntegration(integration.id)
        : await activateIntegration(integration.id);

      if (result) {
        addToast({
          title: isActive
            ? t(
                "payments.integrationDeactivatedTitle",
                "Integración desactivada",
              )
            : t("payments.integrationActivatedTitle", "Integración activada"),
          description: isActive
            ? t(
                "payments.integrationDeactivatedDesc",
                "La integración ha sido desactivada",
              )
            : t(
                "payments.integrationActivatedDesc",
                "La integración ha sido activada",
              ),
          color: "success",
        });
      }
    } catch (error) {
      addToast({
        title: t("payments.toggleErrorTitle", "Error al cambiar estado"),
        description:
          error instanceof Error
            ? error.message
            : t(
                "payments.toggleErrorDesc",
                "No se pudo cambiar el estado de la integración",
              ),
        color: "danger",
      });
    } finally {
      setIsToggling(null);
    }
  };

  const handleEdit = (integration: PaymentIntegration) => {
    setSelectedIntegration(integration);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (integration: PaymentIntegration) => {
    setSelectedIntegration(integration);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="w-full mx-1">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("payments.title", "Integración de Pagos")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t(
              "payments.subtitle",
              "Configura y administra las integraciones con proveedores de pago",
            )}
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="h-4 w-4" />}
          onPress={() => setIsCreateModalOpen(true)}
        >
          {t("payments.addIntegration", "Nueva Integración")}
        </Button>
      </div>

      <PaymentIntegrationsGrid
        integrations={integrations}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
        isToggling={isToggling}
        onTestConnection={testConnection}
      />

      <PaymentIntegrationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
        mode="create"
        businessId={parseInt(businessId)}
      />

      <PaymentIntegrationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedIntegration(null);
        }}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
        mode="edit"
        businessId={parseInt(businessId)}
        integration={selectedIntegration}
      />

      <DeletePaymentIntegrationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedIntegration(null);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        integration={selectedIntegration}
      />
    </div>
  );
}
