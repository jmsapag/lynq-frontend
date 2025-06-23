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
} from "@heroui/react";
import { useFetchLocations } from "../../hooks/users/useFetchLocations";
import { getUserIdFromToken, getUserRoleFromToken } from "../../hooks/auth/useAuth.ts";
import RoleSelector from "./role-selector.tsx";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useDeleteUser } from "../../hooks/users/useDeleteUser.ts";
import { useChangeRole } from "../../hooks/users/useChangeRole.ts";
import { UserRole, UpdateUserResponse } from "../../types/user.ts";

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
}

export default function UserByLocationList({
  users,
  setUsers,
  onEditLocations,
  loading: externalLoading,
  error: externalError,
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

  const onDeleteSuccess = (userName: string, userId: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    addToast({
      title: "Success",
      description: `User ${userName} deleted successfully.`,
      severity: "success",
      color: "success",
    });
  };

  const onDeleteError = (error: Error) => {
    addToast({
      title: "Error",
      description: `Failed to delete user: ${error.message}`,
      severity: "danger",
      color: "danger",
    });
  };

  const { handleChangeRole } = useChangeRole();
  const { handleDeleteUser} = useDeleteUser(onDeleteError);

  // Function to render location names with emojis
  const renderLocations = (locations: UserWithLocations["locations"]) => {
    if (!locations.length) return <Chip size="sm" variant="flat" color="danger">No Locations</Chip>;

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

  // Column definitions for the Table
  const columns = [
    { key: "name", label: "NAME" },
    { key: "email", label: "EMAIL" },
    { key: "role", label: "ROLE" },
    { key: "locations", label: "LOCATIONS" },
    { key: "actions", label: "ACTIONS" },
    { key: "delete", label: "DELETE" },
  ];

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" label="Loading users..." />
        </div>
      ) : error ? (
        <div className="bg-danger-50 text-danger px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <Table
          aria-label="Users by locations table"
          removeWrapper={false}
          isStriped
          isHeaderSticky
          className="h-full"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={sortedUsers} emptyContent={<p>No users found</p>}>
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
                            title: "Success",
                            description: `Role updated to ${updatedUser.role} for ${updatedUser.name}`,
                            severity: "success",
                            color: "success",
                          });
                        },
                        (error: Error) => {
                          addToast({
                            title: "Error",
                            description: `Failed to update role: ${error.message}`,
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
                  <Button
                    size="sm"
                    onPress={() => onEditLocations(user)}
                    color="primary"
                  >
                    Edit Locations
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    size="md"
                    color="danger"
                    onPress={() => {
                      handleDeleteUser(user.id, () =>
                        onDeleteSuccess(user.name, user.id),
                      );
                    }}
                    isIconOnly
                    radius={"lg"}
                    variant={"flat"}
                  >
                    <TrashIcon className={"m-2"} />
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </>
  );
}
