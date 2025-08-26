import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { CreateTicketInput } from "../../types/ticket";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTicketInput) => Promise<void>;
  isLoading: boolean;
}

const CreateTicketModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateTicketModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateTicketInput>({
    subject: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ subject: "", description: "" });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.subject.trim()) {
      newErrors.subject = t("validation.required", {
        field: t("help.ticketForm.subject"),
      });
    }
    if (!formData.description.trim()) {
      newErrors.description = t("validation.required", {
        field: t("help.ticketForm.description"),
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} isDismissable={!isLoading}>
      <ModalContent>
        {(modalOnClose) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              {t("help.openTicket", "Open a Support Ticket")}
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600 text-sm mb-4">
                {t(
                  "help.openTicketText",
                  "Describe your issue and our team will get back to you.",
                )}
              </p>
              <div className="space-y-4">
                <Input
                  label={`${t("help.ticketForm.subject")}`}
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t("help.ticketForm.subjectPlaceholder")}
                  errorMessage={errors.subject}
                  isDisabled={isLoading}
                  isRequired
                />
                <Textarea
                  label={`${t("help.ticketForm.description")}`}
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t("help.ticketForm.descriptionPlaceholder")}
                  errorMessage={errors.description}
                  isDisabled={isLoading}
                  isRequired
                  rows={4}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={modalOnClose}
                disabled={isLoading}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button color="primary" type="submit" isLoading={isLoading}>
                {t("common.submit", "Submit")}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateTicketModal;
