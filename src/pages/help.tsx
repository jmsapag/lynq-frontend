import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, addToast, Spinner } from "@heroui/react";
import { useTickets } from "../hooks/useTickets";
import {
  CreateTicketInput,
  CreateTicketResponse,
  Ticket,
} from "../types/ticket";
import CreateTicketModal from "../components/help/CreateTicketModal";
import { Link } from "react-router-dom";

const TicketStatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const statusMap: { [key: string]: { text: string; className: string } } = {
    open: {
      text: t("help.status.open"),
      className: "bg-blue-100 text-blue-800",
    },
    in_progress: {
      text: t("help.status.in_progress"),
      className: "bg-yellow-100 text-yellow-800",
    },
    closed: {
      text: t("help.status.closed"),
      className: "bg-gray-100 text-gray-800",
    },
  };

  const { text, className } = statusMap[status] || statusMap.closed;

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}
    >
      {text}
    </span>
  );
};

const TicketListItem = ({ ticket }: { ticket: Ticket }) => {
  const { t } = useTranslation();
  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900 truncate">
          {ticket.subject}
        </p>
        <div className="ml-2 flex-shrink-0 flex">
          <TicketStatusBadge status={ticket.status} />
        </div>
      </div>
      <div className="mt-2 sm:flex sm:justify-between">
        <div className="sm:flex">
          <p className="flex items-center text-sm text-gray-500">
            #{ticket.id}
          </p>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
          <p>
            {t("help.lastUpdated")}{" "}
            <time dateTime={ticket.updatedAt}>
              {new Date(ticket.updatedAt).toLocaleDateString()}
            </time>
          </p>
        </div>
      </div>
    </div>
  );
};

const HelpPage = () => {
  const { t } = useTranslation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock business ID - in a real app this would come from context or props
  const businessId = "1";
  const { createTicket, tickets, loading, error } = useTickets(businessId);

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

  const renderTicketList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 border-2 border-dashed border-red-300 rounded-lg text-center mt-4 h-96 flex items-center justify-center bg-red-50">
          <p className="text-red-500">
            {t("help.ticketListError")}: {error}
          </p>
        </div>
      );
    }

    if (tickets.length === 0) {
      return (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center mt-4 h-96 flex items-center justify-center">
          <p className="text-gray-500">{t("help.ticketListPlaceholder")}</p>
        </div>
      );
    }

    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md mt-4">
        <ul className="divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <TicketListItem ticket={ticket} />
            </li>
          ))}
        </ul>
      </div>
    );
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

      {renderTicketList()}

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
