import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  addToast,
  Switch,
} from "@heroui/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useBusinesses } from "../hooks/business/useBusiness";
import { useCreateRegistrationTokens } from "../hooks/auth/useCreateRegistrationTokens.ts";
import { useUsers } from "../hooks/users/useUsers";
import { useDeleteUser } from "../hooks/users/useDeleteUser";
import { useToggleUserActive } from "../hooks/users/useToggleUserActive";
import { useTranslation } from "react-i18next";

const ManageUsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "STANDARD">("STANDARD");
  const [count, setCount] = useState(1);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);

  const [showTokensModal, setShowTokensModal] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 15;

  const { businesses, loading: businessesLoading } = useBusinesses(1, 100);
  const {
    createTokens,
    loading: creating,
    error,
    tokens,
    setTokens,
  } = useCreateRegistrationTokens();

  const { users, loading: usersLoading, pagination } = useUsers(page, limit);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const { deleteUser, loading: deleting } = useDeleteUser();

  const { toggleUserActive, error: toggleError } = useToggleUserActive();
  const [switchLoadingId, setSwitchLoadingId] = useState<number | null>(null);

  const hasNextPage = pagination.hasNextPage;

  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !count || !selectedBusiness) {
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
        setShowModal(false);
        setShowTokensModal(true);
        addToast({
          title: t("manageUsers.successTitle"),
          description: t("manageUsers.successDescription"),
          severity: "success",
          color: "success",
        });
      }
    } catch (err) {
      addToast({
        title: t("manageUsers.errorTitle"),
        description: error || t("manageUsers.errorDescription"),
        severity: "danger",
        color: "danger",
      });
    }
  };

  const handleCloseTokensModal = () => {
    setShowTokensModal(false);
    setTokens(null);
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const registrationLinks =
    tokens?.map((token) => `${baseUrl}/register/${token}`) || [];

  const handleCopyLinks = async () => {
    if (registrationLinks.length > 0) {
      await navigator.clipboard.writeText(registrationLinks.join("\n"));
      addToast({
        title: t("manageUsers.copiedTitle"),
        description: t("manageUsers.copiedDescription"),
        severity: "success",
        color: "success",
      });
    }
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete !== null) {
      const success = await deleteUser(userToDelete);
      setShowDeleteModal(false);
      setUserToDelete(null);
      if (success) {
        addToast({
          title: t("users.deleteSuccessTitle"),
          description: t("users.deleteSuccessDesc"),
          severity: "success",
          color: "success",
        });
        window.location.reload();
      } else {
        addToast({
          title: t("users.deleteErrorTitle"),
          description: t("users.deleteErrorDesc"),
          severity: "danger",
          color: "danger",
        });
      }
    }
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    setSwitchLoadingId(userId);
    const success = await toggleUserActive(userId);
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
      <Modal isOpen={showModal} onOpenChange={setShowModal}>
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
                  if (value === "ADMIN" || value === "STANDARD") setRole(value);
                }}
                required
              >
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
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="bordered"
              size="sm"
              onPress={() => setShowModal(false)}
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

      {/* Tokens Modal */}
      <Modal isOpen={showTokensModal} onOpenChange={handleCloseTokensModal}>
        <ModalContent>
          <ModalHeader>{t("manageUsers.registrationLinks")}</ModalHeader>
          <ModalBody>
            {registrationLinks.length > 0 ? (
              <>
                <ul className="space-y-2">
                  {registrationLinks.map((link, idx) => (
                    <li
                      key={idx}
                      className="bg-gray-100 rounded px-3 py-2 font-mono break-all"
                    >
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="solid"
                  size="sm"
                  className="mt-4"
                  onPress={handleCopyLinks}
                >
                  {t("manageUsers.copyAllLinks")}
                </Button>
              </>
            ) : (
              <div>{t("manageUsers.noTokens")}</div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="solid" size="sm" onPress={handleCloseTokensModal}>
              {t("manageUsers.close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
