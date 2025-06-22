import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Button,
  addToast,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useBusinesses } from "../../hooks/business/useBusiness";
import { useCreateRegistrationTokens } from "../../hooks/auth/useCreateRegistrationTokens";
import { UserRole } from "../../types/user";
import {
  getUserRoleFromToken,
  getBusinessIdFromToken,
} from "../../hooks/auth/useAuth";

interface CreateUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tokens: string[] | null) => void;
}

const CreateUsersModal: React.FC<CreateUsersModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [role, setRole] = useState<UserRole>("STANDARD");
  const [count, setCount] = useState(1);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);

  // Check if current user has LYNQ_TEAM role
  const currentUserRole = getUserRoleFromToken();
  const isLynqTeamUser = currentUserRole === "LYNQ_TEAM";

  // Only fetch businesses if user is LYNQ_TEAM
  const { businesses, loading: businessesLoading } = isLynqTeamUser
    ? useBusinesses(1, 100)
    : { businesses: [], loading: false };

  const {
    createTokens,
    loading: creating,
    error,
  } = useCreateRegistrationTokens();

  useEffect(() => {
    const userRole = getUserRoleFromToken();
    const businessId = getBusinessIdFromToken();

    if (userRole !== "LYNQ_TEAM") {
      setSelectedBusiness(businessId);
    }
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !count || (role !== "LYNQ_TEAM" && !selectedBusiness)) {
      addToast({
        title: t("manageUsers.formErrorTitle"),
        description: t("manageUsers.formErrorDescription"),
        severity: "danger",
        color: "danger",
      });
      return;
    }
    try {
      const result = await createTokens(count, role, selectedBusiness);
      if (result) {
        onClose();
        // Pass the result directly instead of tokens state variable
        onSuccess(result);
        addToast({
          title: t("manageUsers.successTitle"),
          description: t("manageUsers.successDescription"),
          severity: "success",
          color: "success",
        });
      }
    } catch (err) {
      console.error("Error creating users:", err);
      addToast({
        title: t("manageUsers.errorTitle"),
        description: error || t("manageUsers.errorDescription"),
        severity: "danger",
        color: "danger",
      });
    }
  };

  const resetForm = () => {
    setRole("STANDARD");
    setCount(1);
    setSelectedBusiness(null);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleModalClose}>
      <ModalContent>
        <ModalHeader>{t("manageUsers.addUsers")}</ModalHeader>
        <ModalBody>
          <form
            className="space-y-4"
            id="create-users-form"
            onSubmit={handleCreateUser}
          >
            <Select
              label={t("manageUsers.role")}
              value={role}
              onChange={(e) => {
                const value = (e.target as HTMLSelectElement).value;
                setRole(value as UserRole);
              }}
              required
            >
              {isLynqTeamUser ? (
                <SelectItem key="LYNQ_TEAM">LYNQ_TEAM</SelectItem>
              ) : null}
              <SelectItem key="ADMIN">ADMIN</SelectItem>
              <SelectItem key="STANDARD">STANDARD</SelectItem>
            </Select>
            <Input
              label={t("manageUsers.count")}
              type="number"
              min={1}
              value={count.toString()}
              onChange={(e) => setCount(Number(e.target.value))}
              required
            />
            {isLynqTeamUser && (
              <Select
                label={t("manageUsers.business")}
                value={selectedBusiness?.toString() || ""}
                onChange={(e) =>
                  setSelectedBusiness(
                    Number((e.target as HTMLSelectElement).value),
                  )
                }
                required
                isDisabled={businessesLoading}
              >
                {(businesses || []).map((b) => (
                  <SelectItem key={b.id}>{b.name}</SelectItem>
                ))}
              </Select>
            )}
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            variant="bordered"
            size="sm"
            onPress={handleModalClose}
            isDisabled={creating}
          >
            {t("manageUsers.cancel")}
          </Button>
          <Button
            type="submit"
            form="create-users-form"
            variant="solid"
            size="sm"
            isLoading={creating}
          >
            {t("manageUsers.create")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateUsersModal;
