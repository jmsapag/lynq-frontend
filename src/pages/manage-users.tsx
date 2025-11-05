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
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@heroui/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useCreateRegistrationTokens } from "../hooks/auth/useCreateRegistrationTokens.ts";
import { useUsers } from "../hooks/users/useUsers";
import { useDeleteUser } from "../hooks/users/useDeleteUser";
import { useToggleUserActive } from "../hooks/users/useToggleUserActive";
import { useTranslation } from "react-i18next";
import TokensModal from "../components/auth/TokensModal";
import CreateUsersModal from "../components/user-management/CreateUsersModal";
import SearchBar from "../components/search/SearchBar";

const ManageUsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showTokensModal, setShowTokensModal] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 15;

  const { tokens, setTokens } = useCreateRegistrationTokens();

  const { users, loading: usersLoading, pagination } = useUsers(page, limit);

  const [roleFilter, setRoleFilter] = useState<
    "all" | "LYNQ_TEAM" | "ADMIN" | "STANDARD"
  >("all");

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

  const [search, setSearch] = useState("");

  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (u) =>
          (activeFilter === "all"
            ? true
            : activeFilter === "active"
              ? u.is_active
              : !u.is_active) &&
          (roleFilter === "all" ? true : u.role === roleFilter) &&
          (search.trim() === "" ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.business?.name &&
              u.business.name.toLowerCase().includes(search.toLowerCase()))),
      )
    : [];

  return (
    <div className="w-full mx-1">
      <div className="flex justify-end items-center mb-4 gap-4">
        <Select
          placeholder={t("users.filterByStatus")}
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
        <Select
          placeholder={t("users.filterRole")}
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter((e.target as HTMLSelectElement).value as any)
          }
          size="sm"
          className="w-48"
        >
          <SelectItem key="all">{t("users.filterAllRoles")}</SelectItem>
          <SelectItem key="LYNQ_TEAM">LYNQ_TEAM</SelectItem>
          <SelectItem key="ADMIN">ADMIN</SelectItem>
          <SelectItem key="STANDARD">STANDARD</SelectItem>
        </Select>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t("common.search") || "Search users..."}
          className="w-64"
        />
        <Button
          color="primary"
          variant="solid"
          size="sm"
          onPress={() => setShowModal(true)}
        >
          {t("manageUsers.addUsers")}
        </Button>
      </div>

      {/* Users Table */}
      <div className="mb-10">
        {usersLoading && (
          <div className="flex justify-center items-center h-32">
            <Spinner size="lg" />
          </div>
        )}
        <div>
          <Table aria-label="Users table" isStriped>
            <TableHeader>
              <TableColumn>{t("users.email")}</TableColumn>
              <TableColumn>{t("users.role")}</TableColumn>
              <TableColumn>{t("users.business")}</TableColumn>
              <TableColumn>{t("users.createdAt")}</TableColumn>
              <TableColumn className="text-center">
                {t("common.actions")}
              </TableColumn>
              <TableColumn>{t("users.active")}</TableColumn>
            </TableHeader>
            <TableBody emptyContent={usersLoading ? " " : t("users.noUsers")}>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.business?.name || "-"}</TableCell>
                  <TableCell>
                    {new Date(u.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleDeleteClick(u.id)}
                        className="text-danger"
                        isDisabled={deleting}
                        title={t("users.delete")}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
          if (createdTokens && createdTokens.length > 0) {
            setTokens(createdTokens);
            setShowTokensModal(true);
          }
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
