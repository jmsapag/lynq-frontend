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
} from "@heroui/react";

export default function UserByLocationList() {
  const { users, loading, error } = useUsersByLocations();

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
          <TableBody items={users} emptyContent={<p>No users found</p>}>
            {(user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{renderRole(user.role)}</TableCell>
                <TableCell>{renderLocations(user.locations)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
