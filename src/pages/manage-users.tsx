import React, { useState } from "react";
import { Button } from "@heroui/react";
import { useCreateRegistrationTokens } from "../hooks/auth/useCreateRegistrationTokens.ts";
import { useTranslation } from "react-i18next";
import TokensModal from "../components/auth/TokensModal";
import CreateUsersModal from "../components/user-management/CreateUsersModal";

const ManageUsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showTokensModal, setShowTokensModal] = useState(false);

  const { tokens, setTokens } = useCreateRegistrationTokens();

  const handleCloseTokensModal = () => {
    setShowTokensModal(false);
    setTokens(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-end items-center mb-10">
        <Button variant="solid" size="sm" onPress={() => setShowModal(true)}>
          {t("manageUsers.addUsers")}
        </Button>
      </div>

      {/* Create Users Modal */}
      <CreateUsersModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(createdTokens) => {
          // Update tokens state with the tokens received from the modal
          setTokens(createdTokens);
          // Show the tokens modal
          setShowTokensModal(true);
        }}
      />

      {/* Tokens Modal */}
      <TokensModal
        isOpen={showTokensModal}
        onClose={handleCloseTokensModal}
        tokens={tokens}
      />
    </div>
  );
};

export default ManageUsersPage;
