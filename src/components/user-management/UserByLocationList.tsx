import { useMemo, useState } from "react";
import { useUsersByLocations } from "../../hooks/users/useUsersByLocations";
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
} from "@heroui/react";
import LocationSelectionModal from "./LocationSelectionModal";
import { useFetchLocations } from "../../hooks/users/useFetchLocations";

export default function UserByLocationList() {
  const {
    users,
    setUsers,
    loading: usersLoading,
    error: usersError,
  } = useUsersByLocations();
  const {
    locations,
    loading: locationsLoading,
    error: locationsError,
  } = useFetchLocations();
  const loading = usersLoading || locationsLoading;
  const error = usersError || locationsError;
  const [selectedUser, setSelectedUser] = useState<UserWithLocations | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );

  // Function to open the location selection modal
  const handleEditLocations = (user: UserWithLocations) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Function to render location names with emojis
  const renderLocations = (locations: UserWithLocations["locations"]) => {
    if (!locations.length) return "No locations";

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

  // Function to render a role with an appropriate color
  const renderRole = (role: string) => {
    const color = role.toUpperCase() === "ADMIN" ? "success" : "primary";
    return (
      <Chip size="sm" color={color}>
        {role}
      </Chip>
    );
  };

  // Column definitions for the Table
  const columns = [
    { key: "name", label: "NAME" },
    { key: "email", label: "EMAIL" },
    { key: "role", label: "ROLE" },
    { key: "locations", label: "LOCATIONS" },
    { key: "actions", label: "ACTIONS" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Users by Location</h1>
        <p className="text-default-500">
          This page displays a list of users grouped by their respective
          locations.
        </p>
      </div>

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
                <TableCell>{renderRole(user.role)}</TableCell>
                <TableCell>
                  {renderLocations(
                    user.locations.sort((a, b) => a.name.localeCompare(b.name)),
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onPress={() => handleEditLocations(user)}
                    color="primary"
                  >
                    Edit Locations
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {selectedUser && (
        <LocationSelectionModal
          isOpen={isModalOpen}
          locations={locations}
          onClose={handleCloseModal}
          userId={selectedUser.id}
          userName={selectedUser.name}
          users={users}
          setUsers={setUsers}
          selectedLocationIds={selectedUser.locations.map((loc) => loc.id)}
        />
      )}
    </div>
  );
}
