import React, { useState } from "react";
import { Button } from "@heroui/react";
import { useCreateRegistrationTokens } from "../hooks/auth/useCreateRegistrationTokens.ts";
import { useUsers } from "../hooks/users/useUsers";
import { useDeleteUser } from "../hooks/users/useDeleteUser";
import { useToggleUserActive } from "../hooks/users/useToggleUserActive";
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
