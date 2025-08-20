import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TicketForm } from "../components/help/TicketForm";
import { useTickets } from "../hooks/useTickets";
import { CreateTicketInput } from "../types/ticket";

const HelpPage = () => {
  const { t } = useTranslation();
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock business ID - in a real app this would come from context or props
  const businessId = "1";
  const { error, createTicket } = useTickets(businessId);

  const handleSubmitTicket = async (input: CreateTicketInput) => {
    setIsSubmitting(true);
    try {
      await createTicket(input);
      setShowTicketForm(false);
      // You could add a success toast here
    } catch (error) {
      console.error("Failed to create ticket:", error);
      // You could add an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelTicket = () => {
    setShowTicketForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        <section>
          <h5 className="text-l font-medium mb-2">{t("help.userGuide")}</h5>
          <p className="text-gray-600">{t("help.userGuideText")}</p>
        </section>
        
        <section>
          <h5 className="text-l font-medium mb-2">{t("help.faq")}</h5>
          <p className="text-gray-600">{t("help.faqText")}</p>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="text-l font-medium mb-1">{t("help.openTicket")}</h5>
              <p className="text-gray-600 text-sm">{t("help.openTicketText")}</p>
            </div>
            <button
              onClick={() => setShowTicketForm(!showTicketForm)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showTicketForm ? t("help.ticketForm.cancel") : t("help.openTicket")}
            </button>
          </div>
          
          {showTicketForm && (
            <div className="mb-6">
              <TicketForm
                onSubmit={handleSubmitTicket}
                onCancel={handleCancelTicket}
                isLoading={isSubmitting}
              />
            </div>
          )}
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpPage;
