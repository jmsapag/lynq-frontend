import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Button,
  addToast,
  RadioGroup,
  Radio,
  Textarea,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useBusinesses } from "../../hooks/business/useBusiness";
import { useCreateRegistrationTokens } from "../../hooks/auth/useCreateRegistrationTokens";
import { useSendInvitations } from "../../hooks/auth/useSendInvitations";
import { UserRole } from "../../types/user";
import {
  getUserRoleFromToken,
  getBusinessIdFromToken,
} from "../../hooks/auth/useAuth";

interface CreateUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tokens: string[] | null) => void;
}

type InvitationMethod = "link" | "email";

const CreateUsersModal: React.FC<CreateUsersModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [invitationMethod, setInvitationMethod] =
    useState<InvitationMethod>("link");
  const [role, setRole] = useState<UserRole>("STANDARD");
  const [count, setCount] = useState(1);
  const [emails, setEmails] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
  const [language, setLanguage] = useState<"es" | "en">("es");

  const currentUserRole = getUserRoleFromToken();
  const isLynqTeamUser = currentUserRole === "LYNQ_TEAM";

  const { businesses, loading: businessesLoading } = isLynqTeamUser
    ? useBusinesses(1, 100)
    : { businesses: [], loading: false };

  const {
    createTokens,
    loading: creating,
    error: tokenError,
  } = useCreateRegistrationTokens();

  const {
    sendInvitations,
    loading: sendingInvitations,
    error: invitationError,
  } = useSendInvitations();

  useEffect(() => {
    const userRole = getUserRoleFromToken();
    const businessId = getBusinessIdFromToken();

    if (userRole !== "LYNQ_TEAM") {
      setSelectedBusiness(businessId);
    }
  }, []);

  const parseEmails = (emailText: string): string[] => {
    return emailText
      .split(/[\n,;]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role || (role !== "LYNQ_TEAM" && !selectedBusiness)) {
      addToast({
        title: t("manageUsers.formErrorTitle"),
        description: t("manageUsers.formErrorDescription"),
        severity: "danger",
        color: "danger",
      });
      return;
    }

    if (invitationMethod === "link") {
      if (!count || count < 1) {
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
          onClose();
          onSuccess(result);
          addToast({
            title: t("manageUsers.successTitle"),
            description: t("manageUsers.successDescription"),
            severity: "success",
            color: "success",
          });
        }
      } catch (err) {
        console.error("Error creating tokens:", err);
        addToast({
          title: t("manageUsers.errorTitle"),
          description: tokenError || t("manageUsers.errorDescription"),
          severity: "danger",
          color: "danger",
        });
      }
    } else {
      const emailList = parseEmails(emails);
      if (emailList.length === 0) {
        addToast({
          title: t("manageUsers.formErrorTitle"),
          description: t("manageUsers.emailsRequired"),
          severity: "danger",
          color: "danger",
        });
        return;
      }

      try {
        const result = await sendInvitations({
          emails: emailList,
          role,
          business_id: selectedBusiness!,
          language,
        });

        if (result?.success) {
          addToast({
            title: t("manageUsers.invitationsSentTitle"),
            description: t("manageUsers.invitationsSentDescription", {
              count: result.invitations.length,
            }),
            severity: "success",
            color: "success",
          });
          onClose();
        }
      } catch (err) {
        console.error("Error sending invitations:", err);
        addToast({
          title: t("manageUsers.errorTitle"),
          description:
            invitationError || t("manageUsers.invitationsErrorDescription"),
          severity: "danger",
          color: "danger",
        });
      }
    }
  };

  const resetForm = () => {
    setInvitationMethod("link");
    setRole("STANDARD");
    setCount(1);
    setEmails("");
    setLanguage("es");
    setSelectedBusiness(null);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const isLoading = creating || sendingInvitations;

  return (
    <Modal isOpen={isOpen} onOpenChange={handleModalClose}>
      <ModalContent>
        <ModalHeader>{t("manageUsers.addUsers")}</ModalHeader>
        <ModalBody>
          <form
            className="space-y-4"
            id="create-users-form"
            onSubmit={handleCreateUser}
          >
            <RadioGroup
              label={t("manageUsers.invitationMethod")}
              value={invitationMethod}
              onValueChange={(value) =>
                setInvitationMethod(value as InvitationMethod)
              }
            >
              <Radio value="link">{t("manageUsers.inviteByLink")}</Radio>
              <Radio value="email">{t("manageUsers.inviteByEmail")}</Radio>
            </RadioGroup>

            <Select
              label={t("manageUsers.role")}
              value={role}
              onChange={(e) => {
                const value = (e.target as HTMLSelectElement).value;
                setRole(value as UserRole);
              }}
              required
            >
              {isLynqTeamUser ? (
                <SelectItem key="LYNQ_TEAM">LYNQ_TEAM</SelectItem>
              ) : null}
              <SelectItem key="ADMIN">ADMIN</SelectItem>
              <SelectItem key="STANDARD">STANDARD</SelectItem>
            </Select>

            {invitationMethod === "link" ? (
              <Input
                label={t("manageUsers.count")}
                type="number"
                min={1}
                value={count.toString()}
                onChange={(e) => setCount(Number(e.target.value))}
                required
              />
            ) : (
              <>
                <Textarea
                  label={t("manageUsers.emails")}
                  placeholder={t("manageUsers.emailsPlaceholder")}
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  minRows={3}
                  required
                  description={t("manageUsers.emailsDescription")}
                />
                <Select
                  label={t("manageUsers.language")}
                  value={language}
                  onChange={(e) =>
                    setLanguage((e.target as HTMLSelectElement).value as any)
                  }
                  required
                >
                  <SelectItem key="es">Español</SelectItem>
                  <SelectItem key="en">English</SelectItem>
                </Select>
              </>
            )}

            {isLynqTeamUser && (
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
            )}
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            variant="bordered"
            size="sm"
            onPress={handleModalClose}
            isDisabled={isLoading}
          >
            {t("manageUsers.cancel")}
          </Button>
          <Button
            type="submit"
            form="create-users-form"
            variant="solid"
            size="sm"
            isLoading={isLoading}
          >
            {invitationMethod === "link"
              ? t("manageUsers.create")
              : t("manageUsers.sendInvitations")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateUsersModal;
