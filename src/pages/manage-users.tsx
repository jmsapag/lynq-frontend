import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  addToast,
} from "@heroui/react";
import { useBusinesses } from "../hooks/business/useBusiness";
import { useCreateRegistrationTokens } from "../hooks/auth/useCreateRegistrationTokens.ts";
import { useTranslation } from "react-i18next";

const ManageUsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "STANDARD">("STANDARD");
  const [count, setCount] = useState(1);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);

  const [showTokensModal, setShowTokensModal] = useState(false);

  const { businesses, loading: businessesLoading } = useBusinesses(1, 100);
  const {
    createTokens,
    loading: creating,
    error,
    tokens,
    setTokens,
  } = useCreateRegistrationTokens();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !count || !selectedBusiness) {
      addToast({
        title: t("manageUsers.formErrorTitle"),
        description: t("manageUsers.formErrorDescription"),
        severity: "danger",
        color: "danger",
      });
      return;
    }
    try {
      const result = await createTokens(count, role, selectedBusiness);
      if (result) {
        setShowModal(false);
        setShowTokensModal(true);
        addToast({
          title: t("manageUsers.successTitle"),
          description: t("manageUsers.successDescription"),
          severity: "success",
          color: "success",
        });
      }
    } catch (err) {
      addToast({
        title: t("manageUsers.errorTitle"),
        description: error || t("manageUsers.errorDescription"),
        severity: "danger",
        color: "danger",
      });
    }
  };

  const handleCloseTokensModal = () => {
    setShowTokensModal(false);
    setTokens(null);
  };

  // Generate registration links
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const registrationLinks =
    tokens?.map((token) => `${baseUrl}/register/${token}`) || [];

  const handleCopyLinks = async () => {
    if (registrationLinks.length > 0) {
      await navigator.clipboard.writeText(registrationLinks.join("\n"));
      addToast({
        title: t("manageUsers.copiedTitle"),
        description: t("manageUsers.copiedDescription"),
        severity: "success",
        color: "success",
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-end items-center mb-10">
        <Button variant="solid" size="sm" onPress={() => setShowModal(true)}>
          {t("manageUsers.addUsers")}
        </Button>
      </div>

      {/* Create Users Modal */}
      <Modal isOpen={showModal} onOpenChange={setShowModal}>
        <ModalContent>
          <ModalHeader>{t("manageUsers.addUsers")}</ModalHeader>
          <ModalBody>
            <form
              className="space-y-4"
              id="create-users-form"
              onSubmit={handleCreateUser}
            >
              <Select
                label={t("manageUsers.role")}
                value={role}
                onChange={(e) => {
                  const value = (e.target as HTMLSelectElement).value;
                  if (value === "ADMIN" || value === "STANDARD") setRole(value);
                }}
                required
              >
                <SelectItem key="ADMIN">ADMIN</SelectItem>
                <SelectItem key="STANDARD">STANDARD</SelectItem>
              </Select>
              <Input
                label={t("manageUsers.count")}
                type="number"
                min={1}
                value={count.toString()}
                onChange={(e) => setCount(Number(e.target.value))}
                required
              />
              <Select
                label={t("manageUsers.business")}
                value={selectedBusiness?.toString() || ""}
                onChange={(e) =>
                  setSelectedBusiness(
                    Number((e.target as HTMLSelectElement).value),
                  )
                }
                required
                isDisabled={businessesLoading}
              >
                {(businesses || []).map((b) => (
                  <SelectItem key={b.id}>{b.name}</SelectItem>
                ))}
              </Select>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="bordered"
              size="sm"
              onPress={() => setShowModal(false)}
              isDisabled={creating}
            >
              {t("manageUsers.cancel")}
            </Button>
            <Button
              type="submit"
              form="create-users-form"
              variant="solid"
              size="sm"
              isLoading={creating}
            >
              {t("manageUsers.create")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Tokens Modal */}
      <Modal isOpen={showTokensModal} onOpenChange={handleCloseTokensModal}>
        <ModalContent>
          <ModalHeader>{t("manageUsers.registrationLinks")}</ModalHeader>
          <ModalBody>
            {registrationLinks.length > 0 ? (
              <>
                <ul className="space-y-2">
                  {registrationLinks.map((link, idx) => (
                    <li
                      key={idx}
                      className="bg-gray-100 rounded px-3 py-2 font-mono break-all"
                    >
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="solid"
                  size="sm"
                  className="mt-4"
                  onPress={handleCopyLinks}
                >
                  {t("manageUsers.copyAllLinks")}
                </Button>
              </>
            ) : (
              <div>{t("manageUsers.noTokens")}</div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="solid" size="sm" onPress={handleCloseTokensModal}>
              {t("manageUsers.close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ManageUsersPage;
