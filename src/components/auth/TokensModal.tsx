import React from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  addToast,
} from "@heroui/react";
import { useTranslation } from "react-i18next";

interface TokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: string[] | null;
}

const TokensModal: React.FC<TokensModalProps> = ({
  isOpen,
  onClose,
  tokens,
}) => {
  const { t } = useTranslation();

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
    <Modal isOpen={isOpen} onOpenChange={onClose}>
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
          <Button variant="solid" size="sm" onPress={onClose}>
            {t("manageUsers.close")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TokensModal;
