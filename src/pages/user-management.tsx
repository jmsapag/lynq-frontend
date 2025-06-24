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
import SearchBar from "../components/search/SearchBar";

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
  const [locationFilter, setLocationFilter] = useState<string>("all"); // NEW

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

  const [search, setSearch] = useState("");

  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (u) =>
          (roleFilter === "all" ? true : u.role === roleFilter) &&
          (search.trim() === "" ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.name && u.name.toLowerCase().includes(search.toLowerCase()))) &&
          (locationFilter === "all"
            ? true
            : u.locations.some((loc) => String(loc.id) === locationFilter)),
      )
    : [];

  const locationOptions = [
    { key: "all", label: t("users.allLocations") },
    ...(locations?.map((loc) => ({
      key: String(loc.id),
      label: loc.name,
    })) || []),
  ];

  return (
    <div className="w-full mx-1">
      <div className="flex justify-end items-center mb-4 gap-4">
        <Select
          placeholder={t("users.filterByStatus")}
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter((e.target as HTMLSelectElement).value as any)
          }
          size="sm"
          className="w-48"
        >
          <SelectItem key="all">
            {t("users.filterAllRoles") || "All Roles"}
          </SelectItem>
          <SelectItem key="ADMIN">ADMIN</SelectItem>
          <SelectItem key="STANDARD">STANDARD</SelectItem>
        </Select>
        <Select
          placeholder={t("users.filterLocation")}
          value={locationFilter}
          onChange={(e) =>
            setLocationFilter((e.target as HTMLSelectElement).value)
          }
          size="sm"
          className="w-48"
          items={locationOptions}
        >
          {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
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
          onPress={() => setIsCreateUserModalOpen(true)}
        >
          {t("users.addUser")}
        </Button>
      </div>

      <UserByLocationList
        users={filteredUsers}
        setUsers={setUsers}
        onEditLocations={handleEditLocations}
        loading={usersLoading}
        error={usersError}
        t={t}
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

      <TokensModal
        isOpen={isTokensModalOpen}
        onClose={handleCloseTokensModal}
        tokens={tokens}
      />

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
