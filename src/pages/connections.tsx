
import { useState } from "react";
import { Button } from "@heroui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { addToast } from "@heroui/react";
import { useConnections } from "../hooks/useConnections";
import { Connection, CreateConnectionInput, UpdateConnectionInput } from "../types/connection";
import ConnectionsGrid from "../components/connections/ConnectionsGrid";
import ConnectionModal from "../components/connections/ConnectionModal";
import DeleteConnectionModal from "../components/connections/DeleteConnectionModal";

export type ConnectionsPageProps = {
  businessId: string;
  businessName: string;
};

export default function ConnectionsPage(props: ConnectionsPageProps) {
  const { t } = useTranslation();
  const { connections, loading, createConnection, updateConnection, deleteConnection, testConnection } = useConnections(props.businessId);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = async (input: CreateConnectionInput | UpdateConnectionInput): Promise<boolean> => {
    const createInput = input as CreateConnectionInput;
    setIsCreating(true);
    try {
      const result = await createConnection(createInput);
      if (result) {
        addToast({
          title: t("connections.createSuccess", "Connection Created"),
          description: t("connections.createSuccessDesc", "Connection has been created successfully"),
          severity: "success",
          color: "success",
        });
        return true;
      }
      return false;
    } catch (error) {
      addToast({
        title: t("common.error", "Error"),
        description: t("connections.createError", "Failed to create connection"),
        severity: "danger",
        color: "danger",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string, input: CreateConnectionInput | UpdateConnectionInput): Promise<boolean> => {
    if (!selectedConnection) return false;
    
    const updateInput = input as UpdateConnectionInput;
    setIsUpdating(true);
    try {
      const result = await updateConnection(id, updateInput);
      if (result) {
        addToast({
          title: t("connections.updateSuccess", "Connection Updated"),
          description: t("connections.updateSuccessDesc", "Connection has been updated successfully"),
          severity: "success",
          color: "success",
        });
        return true;
      }
      return false;
    } catch (error) {
      addToast({
        title: t("common.error", "Error"),
        description: t("connections.updateError", "Failed to update connection"),
        severity: "danger",
        color: "danger",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (): Promise<boolean> => {
    if (!selectedConnection) return false;
    
    setIsDeleting(true);
    try {
      const result = await deleteConnection(selectedConnection.id);
      if (result) {
        addToast({
          title: t("connections.deleteSuccess", "Connection Deleted"),
          description: t("connections.deleteSuccessDesc", "Connection has been deleted successfully"),
          severity: "success",
          color: "success",
        });
        return true;
      }
      return false;
    } catch (error) {
      addToast({
        title: t("common.error", "Error"),
        description: t("connections.deleteError", "Failed to delete connection"),
        severity: "danger",
        color: "danger",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (connection: Connection) => {
    setSelectedConnection(connection);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (connection: Connection) => {
    setSelectedConnection(connection);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedConnection(null);
  };

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-800 mt-1 text-lg">
            {t("connections.subtitle", "Manage external connections for")} {props.businessName}
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="h-4 w-4" />}
          onPress={() => setIsCreateModalOpen(true)}
        >
          {t("connections.createConnection", "Create Connection")}
        </Button>
      </div>

      {/* Connections Grid */}
          <ConnectionsGrid
            connections={connections}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />

      {/* Create Modal */}
      <ConnectionModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleCreate}
        onTestConnection={testConnection}
        loading={isCreating}
        businessId={props.businessId}
      />

      {/* Edit Modal */}
      <ConnectionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onSubmit={(input) => handleUpdate(selectedConnection?.id || '', input)}
        onTestConnection={testConnection}
        connection={selectedConnection || undefined}
        loading={isUpdating}
        businessId={props.businessId}
      />

      {/* Delete Modal */}
      <DeleteConnectionModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDelete}
        connection={selectedConnection}
        loading={isDeleting}
      />
    </div>
  );
}