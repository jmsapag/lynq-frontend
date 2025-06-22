import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  addToast,
  Switch,
} from "@heroui/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useCreateRegistrationTokens } from "../hooks/auth/useCreateRegistrationTokens.ts";
import { useUsers } from "../hooks/users/useUsers";
import { useDeleteUser } from "../hooks/users/useDeleteUser";
import { useToggleUserActive } from "../hooks/users/useToggleUserActive";
import { useTranslation } from "react-i18next";
import TokensModal from "../components/auth/TokensModal";
import CreateUsersModal from "../components/user-management/CreateUsersModal";

const ManageUsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showTokensModal, setShowTokensModal] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 15;

  const { tokens, setTokens } = useCreateRegistrationTokens();

  const { users, loading: usersLoading, pagination } = useUsers(page, limit);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteError = (error: Error) => {
    setDeleting(false);
    addToast({
      title: t("users.deleteErrorTitle"),
      description: error.message || t("users.deleteErrorDesc"),
      severity: "danger",
      color: "danger",
    });
  };

  const { handleDeleteUser } = useDeleteUser(handleDeleteError);

  const { toggleUserActive, error: toggleError } = useToggleUserActive();
  const [switchLoadingId, setSwitchLoadingId] = useState<number | null>(null);

  const hasNextPage = pagination.hasNextPage;

  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const handleCloseTokensModal = () => {
    setShowTokensModal(false);
    setTokens(null);
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete !== null) {
      setDeleting(true);
      const onSuccess = () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
        addToast({
          title: t("users.deleteSuccessTitle"),
          description: t("users.deleteSuccessDesc"),
          severity: "success",
          color: "success",
        });
        window.location.reload();
      };

      handleDeleteUser(userToDelete, onSuccess);
    }
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    setSwitchLoadingId(userId);
    const success = await toggleUserActive(userId, !currentActive);
    setSwitchLoadingId(null);
    if (success) {
      addToast({
        title: t("users.active"),
        description: currentActive ? t("common.no") : t("common.yes"),
        severity: "success",
        color: "success",
      });
      window.location.reload();
    } else {
      addToast({
        title: t("common.error"),
        description: toggleError || t("users.toggleErrorDesc"),
        severity: "danger",
        color: "danger",
      });
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter((u) =>
        activeFilter === "all"
          ? true
          : activeFilter === "active"
            ? u.is_active
            : !u.is_active,
      )
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-end items-center mb-4">
        <Select
          placeholder={t("users.filterAll")}
          value={activeFilter}
          onChange={(e) =>
            setActiveFilter((e.target as HTMLSelectElement).value as any)
          }
          size="sm"
          className="w-48"
        >
          <SelectItem key="all">{t("users.filterAll")}</SelectItem>
          <SelectItem key="active">{t("users.filterActive")}</SelectItem>
          <SelectItem key="inactive">{t("users.filterInactive")}</SelectItem>
        </Select>
        <Button
          variant="solid"
          size="sm"
          onPress={() => setShowModal(true)}
          className="ml-4"
        >
          {t("manageUsers.addUsers")}
        </Button>
      </div>

      {/* Users Table */}
      <div className="mb-10">
        {usersLoading && (
          <div className="text-sm text-gray-500 mb-3">
            {t("common.loading")}
          </div>
        )}
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="py-2 px-3 font-medium text-gray-700">
                  {t("users.email")}
                </th>
                <th className="py-2 px-3 font-medium text-gray-700">
                  {t("users.role")}
                </th>
                <th className="py-2 px-3 font-medium text-gray-700">
                  {t("users.business")}
                </th>
                <th className="py-2 px-3 font-medium text-gray-700">
                  {t("users.createdAt")}
                </th>
                <th className="py-2 px-3 font-medium text-gray-700 text-center">
                  {t("common.actions")}
                </th>
                <th className="py-2 px-3 font-medium text-gray-700">
                  {t("users.active")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => (
                <tr
                  key={u.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-2 px-3 text-gray-900">{u.email}</td>
                  <td className="py-2 px-3 text-gray-800">{u.role}</td>
                  <td className="py-2 px-3 text-gray-800">
                    {u.business?.name || "-"}
                  </td>
                  <td className="py-2 px-3 text-gray-500">
                    {new Date(u.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 flex justify-center gap-2">
                    <button
                      className="text-red-500 hover:text-red-700 p-1"
                      onClick={() => handleDeleteClick(u.id)}
                      disabled={deleting}
                      title={t("users.delete")}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                  <td className="py-2 px-3 text-gray-800">
                    <Switch
                      isSelected={u.is_active}
                      onChange={() => handleToggleActive(u.id, u.is_active)}
                      aria-label={t("users.active")}
                      disabled={
                        switchLoadingId !== null && switchLoadingId !== u.id
                      }
                    >
                      {u.is_active}
                    </Switch>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !usersLoading && (
                <tr>
                  <td colSpan={6} className="py-4 px-3 text-gray-400">
                    {t("users.noUsers")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex justify-center items-center gap-4">
        <Button
          variant="bordered"
          size="sm"
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          isDisabled={page === 1 || usersLoading}
        >
          {t("common.previous")}
        </Button>
        <span className="text-sm text-gray-600">
          {t("common.page")} {page}
        </span>
        <Button
          variant="bordered"
          size="sm"
          onPress={() => setPage((p) => p + 1)}
          isDisabled={!hasNextPage || usersLoading}
        >
          {t("common.next")}
        </Button>
      </div>

      {/* Create Users Modal */}
      <CreateUsersModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(createdTokens) => {
          setTokens(createdTokens);
          setShowTokensModal(true);
        }}
      />

      {/* Tokens Modal */}
      <TokensModal
        isOpen={showTokensModal}
        onClose={handleCloseTokensModal}
        tokens={tokens}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <ModalContent>
          <ModalHeader>{t("users.deleteUser")}</ModalHeader>
          <ModalBody>{t("users.deleteConfirm")}</ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              size="sm"
              onPress={() => setShowDeleteModal(false)}
              isDisabled={deleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="solid"
              color="danger"
              size="sm"
              onPress={handleConfirmDelete}
              isLoading={deleting}
            >
              {t("users.delete")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ManageUsersPage;
