import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, addToast } from "@heroui/react";
import { useTickets } from "../hooks/useTickets";
import { CreateTicketInput, CreateTicketResponse } from "../types/ticket";
import CreateTicketModal from "../components/help/CreateTicketModal";

const HelpPage = () => {
  const { t } = useTranslation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock business ID - in a real app this would come from context or props
  const businessId = "1";
  const { createTicket } = useTickets(businessId);

  const handleSubmitTicket = async (input: CreateTicketInput) => {
    setIsSubmitting(true);
    try {
      const result: CreateTicketResponse = await createTicket(input);
      addToast({
        title: t("help.ticketForm.successTitle", "Ticket Created"),
        description: t("help.ticketForm.success", {
          ticketId: result.ticketId,
        }),
        severity: "success",
        color: "success",
      });
      setIsCreateModalOpen(false);
    } catch (error: any) {
      addToast({
        title: t("toasts.errorTitle", "Error"),
        description:
          error.message ||
          t("help.ticketForm.genericError", "An unexpected error occurred."),
        severity: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div className="w-full mx-1">
      <div className="flex justify-end items-center mb-4 gap-4">
        <Button
          color="primary"
          variant="solid"
          size="sm"
          onPress={() => setIsCreateModalOpen(true)}
        >
          {t("help.openTicket")}
        </Button>
      </div>

      {/* Placeholder for future ticket list */}
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center mt-4">
        <p className="text-gray-500">
          {t(
            "help.ticketListPlaceholder",
            "Your support tickets will be displayed here.",
          )}
        </p>
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTicket}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default HelpPage;
