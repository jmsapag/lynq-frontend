import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, addToast } from "@heroui/react";
import { useTickets } from "../hooks/useTickets";
import { CreateTicketInput, CreateTicketResponse } from "../types/ticket";
import CreateTicketModal from "../components/help/CreateTicketModal";
import { Link } from "react-router-dom";

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
        title: t("help.ticketForm.successTitle"),
        description: t("help.ticketForm.success", {
          ticketId: result.ticketId,
        }),
        severity: "success",
      });
      setIsCreateModalOpen(false);
    } catch (error: any) {
      addToast({
        title: t("toasts.errorTitle"),
        description: error.message || t("help.ticketForm.error"),
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
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="text-sm">
          {t("help.needHelp")}{" "}
          <Link to="/faq" className="text-primary-600 hover:underline">
            {t("help.faqLink")}
          </Link>
          .
        </div>
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
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center mt-4 h-96 flex items-center justify-center">
        <p className="text-gray-500">{t("help.ticketListPlaceholder")}</p>
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
