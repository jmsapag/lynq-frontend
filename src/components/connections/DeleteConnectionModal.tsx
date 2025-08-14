import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { Connection } from "../../types/connection";

interface DeleteConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  connection: Connection | null;
  loading?: boolean;
}

const DeleteConnectionModal: React.FC<DeleteConnectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  connection,
  loading = false,
}) => {
  const { t } = useTranslation();

  const handleConfirm = async () => {
    const success = await onConfirm();
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
      <ModalContent>
        <ModalHeader>
          {t("connections.deleteConnection", "Delete Connection")}
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600">
            {t(
              "connections.deleteConfirmation",
              "Are you sure you want to delete this connection?"
            )}
          </p>
          {connection && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{connection.name}</p>
              <p className="text-sm text-gray-600">{connection.provider}</p>
              <p className="text-sm text-gray-600">User: {connection.user}</p>
            </div>
          )}
          <p className="text-sm text-red-600 mt-2">
            {t(
              "connections.deleteWarning",
              "This action cannot be undone."
            )}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="bordered"
            onPress={onClose}
            isDisabled={loading}
          >
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            color="danger"
            onPress={handleConfirm}
            isLoading={loading}
          >
            {t("common.delete", "Delete")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteConnectionModal;
