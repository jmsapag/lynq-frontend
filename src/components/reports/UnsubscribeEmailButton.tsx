import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useUnsubscribeEmail } from "../../hooks/users/useUnsubscribeEmail";
import { useSelfUserProfile } from "../../hooks/users/useSelfUserProfile";
import { addToast } from "@heroui/react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

interface UnsubscribeEmailButtonProps {
  unsubscribeToken?: string; // Optional token from URL (for email links) - kept for backward compatibility
}

const UnsubscribeEmailButton = ({
  unsubscribeToken,
}: UnsubscribeEmailButtonProps) => {
  const { t } = useTranslation();
  const { user, loading: userLoading } = useSelfUserProfile();
  const { unsubscribeEmail, loading, error } = useUnsubscribeEmail();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUnsubscribe = async () => {
    // User is identified by the Bearer token in the Authorization header
    // No need to pass parameters - the endpoint uses the authenticated user
    const success = await unsubscribeEmail();

    if (success) {
      setIsSuccess(true);
      addToast({
        title: t(
          "reports.unsubscribe.successTitle",
          "Unsubscribed successfully",
        ),
        description: t(
          "reports.unsubscribe.successDescription",
          "You have been unsubscribed from LYNQ email notifications.",
        ),
        severity: "success",
        color: "success",
      });
    } else {
      addToast({
        title: t("reports.unsubscribe.errorTitle", "Unsubscribe failed"),
        description:
          error ||
          t(
            "reports.unsubscribe.errorDescription",
            "Failed to unsubscribe. Please try again later.",
          ),
        severity: "danger",
        color: "danger",
      });
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsSuccess(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSuccess(false);
  };

  // Auto-open modal if unsubscribeToken is present (from email links)
  useEffect(() => {
    if (unsubscribeToken) {
      setIsModalOpen(true);
    }
  }, [unsubscribeToken]);

  return (
    <>
      <Button
        variant="bordered"
        color="default"
        size="sm"
        onPress={handleOpenModal}
        startContent={<EnvelopeIcon className="w-4 h-4" />}
        className="text-gray-700"
        isDisabled={userLoading}
      >
        {t("reports.unsubscribe.button", "Unsubscribe from emails")}
      </Button>

      <Modal isOpen={isModalOpen} onOpenChange={handleCloseModal} size="sm">
        <ModalContent>
          {isSuccess ? (
            <>
              <ModalHeader>
                {t(
                  "reports.unsubscribe.successTitle",
                  "Unsubscribed successfully",
                )}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-success-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-center text-gray-600">
                    {t(
                      "reports.unsubscribe.successMessage",
                      "You have been successfully unsubscribed from LYNQ email notifications. You will no longer receive email reports or notifications.",
                    )}
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={handleCloseModal}>
                  {t("common.close", "Close")}
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader>
                {t(
                  "reports.unsubscribe.confirmTitle",
                  "Unsubscribe from emails",
                )}
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-600 mb-4">
                  {t(
                    "reports.unsubscribe.confirmMessage",
                    "Are you sure you want to unsubscribe from LYNQ email notifications?",
                  )}
                </p>
                <div className="bg-warning-50 border border-warning-200 text-warning-700 p-3 rounded-md">
                  <p className="text-sm font-semibold mb-1">
                    {t("common.warning", "Warning")}
                  </p>
                  <p className="text-sm">
                    {t(
                      "reports.unsubscribe.warning",
                      "You will no longer receive email reports, alerts, or other notifications from LYNQ.",
                    )}
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="bordered"
                  onPress={handleCloseModal}
                  isDisabled={loading}
                >
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button
                  color="danger"
                  onPress={handleUnsubscribe}
                  isLoading={loading}
                >
                  {t("reports.unsubscribe.confirm", "Unsubscribe")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default UnsubscribeEmailButton;
