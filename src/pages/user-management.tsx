import { useState } from "react";
import { Button } from "@heroui/react";
import UserByLocationList from "../components/user-management/UserByLocationList.tsx";
import LocationSelectionModal from "../components/user-management/LocationSelectionModal";
import TokensModal from "../components/auth/TokensModal";
import CreateUsersModal from "../components/user-management/CreateUsersModal";
import { useCreateRegistrationTokens } from "../hooks/auth/useCreateRegistrationTokens";
import { useFetchLocations } from "../hooks/users/useFetchLocations";
import { UserWithLocations } from "../types/location";
import { useUsersByLocations } from "../hooks/users/useUsersByLocations";

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<UserWithLocations | null>(
    null,
  );
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isTokensModalOpen, setIsTokensModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const { locations } = useFetchLocations();
  const {
    users,
    setUsers,
    loading: usersLoading,
    error: usersError,
  } = useUsersByLocations();
  const { tokens, setTokens } = useCreateRegistrationTokens();

  // Function to open the location selection modal
  const handleEditLocations = (user: UserWithLocations) => {
    setSelectedUser(user);
    setIsLocationModalOpen(true);
  };

  // Function to close the location selection modal
  const handleCloseLocationModal = () => {
    setIsLocationModalOpen(false);
    setSelectedUser(null);
  };

  // Function to handle closing the tokens modal
  const handleCloseTokensModal = () => {
    setIsTokensModalOpen(false);
    setTokens(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2 justify-between">
        <div className="flex flex-col gap-1"></div>
        <div className="flex flex-row gap-2">
          <Button
            color="primary"
            onPress={() => setIsCreateUserModalOpen(true)}
          >
            Invite Users
          </Button>
          <Button>Add Location</Button>
        </div>
      </div>

      <UserByLocationList
        users={users}
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
          // Update tokens state with the tokens received from the modal
          setTokens(createdTokens);
          // Show the tokens modal
          setIsTokensModalOpen(true);
        }}
      />
    </div>
  );
}
