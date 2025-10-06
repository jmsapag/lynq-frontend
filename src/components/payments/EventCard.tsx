import React from "react";
import { Card, CardBody, Chip, Code } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { ManualSubscription } from "../../hooks/payments/useSubscriptionEvents";

interface EventCardProps {
  event: ManualSubscription;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, any> = {
      active: "success",
      payment_due: "warning",
      pending_approval: "primary",
      blocked: "danger",
    };
    return colorMap[status] || "default";
  };

  const getStatusLabel = (status: string) => {
    return t(`billing.manualStatus.${status}`, status);
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardBody className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Chip
                  color={getStatusColor(event.status)}
                  variant="flat"
                  size="sm"
                >
                  {getStatusLabel(event.status)}
                </Chip>
                <span className="text-sm text-default-500">ID: {event.id}</span>
              </div>
              <span className="text-sm text-default-400">
                {new Date(event.nextExpirationDate).toLocaleDateString()}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">
                  {t("subscriptions.events.businessId", "Business ID")}:
                </span>{" "}
                {event.businessId}
              </p>

              {event.invoiceFileName && (
                <p className="text-sm">
                  <span className="font-medium">Invoice:</span>{" "}
                  <a
                    href={event.invoiceFileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Invoice
                  </a>
                </p>
              )}

              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium mb-2 hover:text-primary">
                  {t("subscriptions.events.viewDetails", "View details")}
                </summary>
                <Code className="w-full max-h-40 overflow-auto text-xs">
                  {JSON.stringify(event, null, 2)}
                </Code>
              </details>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default EventCard;
