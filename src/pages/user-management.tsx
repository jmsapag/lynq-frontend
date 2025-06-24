import { useState } from "react";
import { Button, Select, SelectItem } from "@heroui/react";
import UserByLocationList from "../components/user-management/UserByLocationList.tsx";
import LocationSelectionModal from "../components/user-management/LocationSelectionModal";
import TokensModal from "../components/auth/TokensModal";
import CreateUsersModal from "../components/user-management/CreateUsersModal";
import { useCreateRegistrationTokens } from "../hooks/auth/useCreateRegistrationTokens";
import { useFetchLocations } from "../hooks/users/useFetchLocations";
import { UserWithLocations } from "../types/location";
import { useUsersByLocations } from "../hooks/users/useUsersByLocations";
import { useTranslation } from "react-i18next";

export default function UserManagement() {
  const { t } = useTranslation();

  const [selectedUser, setSelectedUser] = useState<UserWithLocations | null>(
    null,
  );
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isTokensModalOpen, setIsTokensModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const [roleFilter, setRoleFilter] = useState<"all" | "ADMIN" | "STANDARD">(
    "all",
  );

  const { locations } = useFetchLocations();
  const {
    users,
    setUsers,
    loading: usersLoading,
    error: usersError,
  } = useUsersByLocations();
  const { tokens, setTokens } = useCreateRegistrationTokens();

  const handleEditLocations = (user: UserWithLocations) => {
    setSelectedUser(user);
    setIsLocationModalOpen(true);
  };

  const handleCloseLocationModal = () => {
    setIsLocationModalOpen(false);
    setSelectedUser(null);
  };

  const handleCloseTokensModal = () => {
    setIsTokensModalOpen(false);
    setTokens(null);
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter((u) => (roleFilter === "all" ? true : u.role === roleFilter))
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2 justify-between">
        <div className="flex flex-col gap-1"></div>
        <div className="flex flex-row gap-2">
          <Select
            placeholder={t("users.filterByStatus")}
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter((e.target as HTMLSelectElement).value as any)
            }
            size="sm"
            className="w-48"
          >
            <SelectItem key="all">All Roles</SelectItem>
            <SelectItem key="ADMIN">ADMIN</SelectItem>
            <SelectItem key="STANDARD">STANDARD</SelectItem>
          </Select>
          <Button
            variant="solid"
            size="sm"
            onPress={() => setIsCreateUserModalOpen(true)}
            className="ml-4"
          >
            Invite Users
          </Button>
        </div>
      </div>

      <UserByLocationList
        users={filteredUsers}
        setUsers={setUsers}
        onEditLocations={handleEditLocations}
        loading={usersLoading}
        error={usersError}
      />

      {selectedUser && (
        <LocationSelectionModal
          isOpen={isLocationModalOpen}
          locations={locations}
          onClose={handleCloseLocationModal}
          userId={selectedUser.id}
          userName={selectedUser.name}
          users={users}
          setUsers={setUsers}
          selectedLocationIds={selectedUser.locations.map((loc) => loc.id)}
        />
      )}

      {/* Registration Tokens Modal */}
      <TokensModal
        isOpen={isTokensModalOpen}
        onClose={handleCloseTokensModal}
        tokens={tokens}
      />

      {/* Create Users Modal */}
      <CreateUsersModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSuccess={(createdTokens) => {
          setTokens(createdTokens);
          setIsTokensModalOpen(true);
        }}
      />
    </div>
  );
}
