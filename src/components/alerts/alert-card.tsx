import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import {
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Alert, AlertSeverity, AlertStatus } from "../../types/alert";
import { formatDistanceToNow } from "date-fns";

interface AlertCardProps {
  alert: Alert;
  onMarkAsRead: (id: number) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onMarkAsRead,
}) => {
  const getSeverityConfig = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.ERROR:
        return {
          icon: ExclamationCircleIcon,
          color: "danger" as const,
          bgColor: "bg-red-50",
          iconColor: "text-red-600",
        };
      case AlertSeverity.WARN:
        return {
          icon: ExclamationTriangleIcon,
          color: "warning" as const,
          bgColor: "bg-yellow-50",
          iconColor: "text-yellow-600",
        };
      case AlertSeverity.INFO:
        return {
          icon: InformationCircleIcon,
          color: "primary" as const,
          bgColor: "bg-blue-50",
          iconColor: "text-blue-600",
        };
    }
  };

  const config = getSeverityConfig(alert.severity);
  const Icon = config.icon;
  const isUnread = alert.status === AlertStatus.UNREAD;

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(alert.id);
    }
  };

  return (
    <Card
      className={`w-full cursor-pointer transition-all hover:shadow-md ${
        isUnread ? "border-l-4 border-primary" : ""
      }`}
      isPressable
      onPress={handleClick}
    >
      <CardBody className="p-4">
        <div className="flex gap-4">
          <div className={`flex-shrink-0 p-2 rounded-lg ${config.bgColor}`}>
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3
                  className={`text-sm font-semibold ${
                    isUnread ? "text-gray-900" : "text-gray-600"
                  }`}
                >
                  {alert.title}
                </h3>
                {alert.locationName && (
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.locationName}
                  </p>
                )}
              </div>
              <Chip size="sm" color={config.color} variant="flat">
                {alert.severity}
              </Chip>
            </div>

            <p
              className={`text-sm mb-2 ${
                isUnread ? "text-gray-700" : "text-gray-500"
              }`}
            >
              {alert.message}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(alert.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {isUnread && (
                <span className="text-xs font-medium text-primary">New</span>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
