import { useState } from "react";
import { UserWithLocations } from "../../types/location";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Spinner,
  Chip,
  Button,
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { useFetchLocations } from "../../hooks/users/useFetchLocations";
import {
  getUserIdFromToken,
  getUserRoleFromToken,
} from "../../hooks/auth/useAuth.ts";
import RoleSelector from "./role-selector.tsx";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useDeleteUser } from "../../hooks/users/useDeleteUser.ts";
import { useChangeRole } from "../../hooks/users/useChangeRole.ts";
import { UserRole, UpdateUserResponse } from "../../types/user.ts";
import { useTranslation } from "react-i18next";

interface UserByLocationListProps {
  users: UserWithLocations[];
  setUsers: (
    users:
      | UserWithLocations[]
      | ((prev: UserWithLocations[]) => UserWithLocations[]),
  ) => void;
  onEditLocations: (user: UserWithLocations) => void;
  loading?: boolean;
  error?: string | null;
  t: ReturnType<typeof useTranslation>["t"];
}

export default function UserByLocationList({
  users,
  setUsers,
  onEditLocations,
  loading: externalLoading,
  error: externalError,
  t = useTranslation().t,
}: UserByLocationListProps) {
  const { loading: locationsLoading, error: locationsError } =
    useFetchLocations();
  const loading = externalLoading || locationsLoading;
  const error = externalError || locationsError;

  const userRole: string = getUserRoleFromToken();
  const userId: number = getUserIdFromToken();

  const sortedUsers = [...users]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((user) => user.id !== userId);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithLocations | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const onDeleteSuccess = (_user: string, userId: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    addToast({
      title: t("toasts.deleteSuccessTitle"),
      description: t("toasts.deleteSuccessDesc"),
      severity: "success",
      color: "success",
    });
  };

  const onDeleteError = (error: Error) => {
    setDeleting(false);
    addToast({
      title: t("toasts.deleteErrorTitle"),
      description: t("toasts.deleteErrorDesc") + `: ${error.message}`,
      severity: "danger",
      color: "danger",
    });
  };

  const { handleChangeRole } = useChangeRole();
  const { handleDeleteUser } = useDeleteUser(onDeleteError);

  const renderLocations = (locations: UserWithLocations["locations"]) => {
    if (!locations.length)
      return (
        <Chip size="sm" variant="flat" color="danger">
          {t("users.businessLocation")}
        </Chip>
      );

    return locations.map((location, index) => {
      return (
        <span key={location.id} className="mr-2">
          {index > 0 && " "}
          <Chip size="sm" variant="flat" color="primary">
            {location.name}
          </Chip>
        </span>
      );
    });
  };

  const columns = [
    { key: "name", label: t("users.fullName") },
    { key: "email", label: t("users.email") },
    { key: "role", label: t("users.role") },
    { key: "locations", label: t("users.businessLocation") },
    { key: "actions", label: t("common.actions") },
  ];

  const handleDeleteClick = (user: UserWithLocations) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setDeleting(true);
      handleDeleteUser(userToDelete.id, () => {
        onDeleteSuccess(userToDelete.name, userToDelete.id);
        setShowDeleteModal(false);
        setUserToDelete(null);
        setDeleting(false);
      });
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" label={t("common.loading")} />
        </div>
      ) : error ? (
        <div className="bg-danger-50 text-danger px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <Table aria-label={t("users.management")} isStriped>
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={sortedUsers}
            emptyContent={<p>{t("users.noUsers")}</p>}
          >
            {(user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <RoleSelector
                    initialRole={user.role}
                    userId={user.id}
                    currentUserRole={userRole}
                    onRoleChange={(userId, newRole) => {
                      handleChangeRole(
                        userId,
                        newRole as UserRole,
                        (updatedUser: UpdateUserResponse) => {
                          setUsers((prev) =>
                            prev.map((u) =>
                              u.id === userId
                                ? { ...u, role: updatedUser.role }
                                : u,
                            ),
                          );
                          addToast({
                            title: t("toasts.successTitle"),
                            description:
                              t("users.role") +
                              `: ${t(`role.${updatedUser.role}`)} - ${updatedUser.name}`,
                            severity: "success",
                            color: "success",
                          });
                        },
                        (error: Error) => {
                          addToast({
                            title: t("toasts.errorTitle"),
                            description:
                              t("toasts.profileUpdateErrorDescription") +
                              `: ${error.message}`,
                            severity: "danger",
                            color: "danger",
                          });
                        },
                      );
                    }}
                  />
                </TableCell>
                <TableCell>
                  {renderLocations(
                    user.locations.sort((a, b) => a.name.localeCompare(b.name)),
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onPress={() => onEditLocations(user)}
                      startContent={<PencilIcon className="w-4 h-4 mr-1" />}
                    >
                      {t("users.editLocation")}
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      onPress={() => handleDeleteClick(user)}
                      isIconOnly
                      variant="light"
                    >
                      <TrashIcon className="m-2" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <ModalContent>
          <ModalHeader>{t("users.deleteUser")}</ModalHeader>
          <ModalBody>
            <p>
              {t("users.deleteConfirm")}
              {userToDelete && ` "${userToDelete.name}"`}
            </p>
          </ModalBody>
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
    </>
  );
}
