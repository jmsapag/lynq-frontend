import React from "react";
import { Card, CardBody, Chip, Code } from "@heroui/react";
import { SubscriptionEvent } from "../../hooks/payments/useSubscriptionEvents";

interface EventCardProps {
  event: SubscriptionEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const getEventTypeColor = (type: string) => {
    const colorMap: Record<string, any> = {
      subscription_created: "success",
      subscription_updated: "warning",
      subscription_cancelled: "danger",
      payment_successful: "success",
      payment_failed: "danger",
      payment_pending: "warning",
    };
    return colorMap[type] || "default";
  };

  const getEventTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      subscription_created: "Suscripción Creada",
      subscription_updated: "Suscripción Actualizada",
      subscription_cancelled: "Suscripción Cancelada",
      payment_successful: "Pago Exitoso",
      payment_failed: "Pago Fallido",
      payment_pending: "Pago Pendiente",
    };
    return labelMap[type] || type;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardBody className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <Chip
                  color={getEventTypeColor(event.type)}
                  variant="flat"
                  size="sm"
                >
                  {getEventTypeLabel(event.type)}
                </Chip>
                <span className="text-sm text-default-500">{event.source}</span>
              </div>
              <span className="text-sm text-default-400">
                {new Date(event.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Empresa ID:</span>{" "}
                {event.companyId}
              </p>

              {Object.keys(event.payload).length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Ver detalles del evento
                  </summary>
                  <Code className="w-full max-h-40 overflow-auto text-xs">
                    {JSON.stringify(event.payload, null, 2)}
                  </Code>
                </details>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default EventCard;
