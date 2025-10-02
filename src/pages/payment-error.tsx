import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardBody, Button, addToast } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import CreateTicketModal from "../components/help/CreateTicketModal";
import { useTickets } from "../hooks/useTickets";
import { CreateTicketInput } from "../types/ticket";

const PaymentError = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reason = searchParams.get("reason");

  // Mock business ID - in real app would come from context/token
  const businessId = "1";
  const { createTicket } = useTickets(businessId);

  // Get contextual message based on reason
  const getErrorMessage = () => {
    switch (reason) {
      case "cancelled_by_user":
        return {
          title: t("payment.error.cancelledTitle"),
          description: t("payment.error.cancelledByUser"),
        };
      default:
        return {
          title: t("payment.error.title"),
          description: t("payment.error.genericError"),
        };
    }
  };

  const { title, description } = getErrorMessage();

  const handleTryAgain = () => {
    // Redirect to plans page to retry checkout
    navigate("/plans");
  };

  const handleContactSupport = () => {
    setIsTicketModalOpen(true);
  };

  const handleSubmitTicket = async (input: CreateTicketInput) => {
    setIsSubmitting(true);
    try {
      const result = await createTicket(input);
      addToast({
        title: t("help.ticketForm.successTitle"),
        description: t("help.ticketForm.success", {
          ticketId: result.ticketId,
        }),
        severity: "success",
        color: "success",
      });
      setIsTicketModalOpen(false);
    } catch (error: any) {
      addToast({
        title: t("toasts.errorTitle"),
        description: error.message || t("help.ticketForm.error"),
        severity: "danger",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsTicketModalOpen(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-2xl w-full border-warning">
        <CardBody className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="rounded-full bg-warning-100 p-4">
              <ExclamationTriangleIcon className="w-16 h-16 text-warning-600" />
            </div>

            {/* Title and Description */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 max-w-md">{description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-4">
              <Button
                color="warning"
                variant="solid"
                size="lg"
                onPress={handleTryAgain}
                className="w-full sm:w-auto min-w-[160px]"
              >
                {t("payment.error.tryAgain")}
              </Button>
              <Button
                color="default"
                variant="bordered"
                size="lg"
                onPress={handleContactSupport}
                className="w-full sm:w-auto min-w-[160px]"
              >
                {t("payment.error.contactSupport")}
              </Button>
            </div>

            {/* Additional info */}
            <div className="text-sm text-gray-500 pt-4">
              {t("payment.error.needHelp")}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Support Ticket Modal */}
      <CreateTicketModal
        isOpen={isTicketModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTicket}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default PaymentError;


