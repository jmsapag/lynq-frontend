import type React from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { SubscriptionCardAction } from "./SubscriptionCard";

export type NoticeTone = "success" | "info" | "warning" | "danger";

interface ToneConfig {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  card: string;
  accent: string;
  chipColor: "success" | "primary" | "warning" | "danger";
}

const toneConfig: Record<NoticeTone, ToneConfig> = {
  success: {
    icon: CheckCircleIcon,
    card: "border-success-200 bg-success-50/60",
    accent: "text-success-700",
    chipColor: "success",
  },
  info: {
    icon: InformationCircleIcon,
    card: "border-primary-200 bg-primary-50/60",
    accent: "text-primary-700",
    chipColor: "primary",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    card: "border-warning-200 bg-warning-50/60",
    accent: "text-warning-700",
    chipColor: "warning",
  },
  danger: {
    icon: XCircleIcon,
    card: "border-danger-200 bg-danger-50/60",
    accent: "text-danger-700",
    chipColor: "danger",
  },
};

interface SubscriptionStateNoticeProps {
  tone: NoticeTone;
  title: string;
  description: string;
  statusLabel?: string;
  actions?: SubscriptionCardAction[];
  helperText?: string;
}

export const SubscriptionStateNotice = ({
  tone,
  title,
  description,
  statusLabel,
  actions,
  helperText,
}: SubscriptionStateNoticeProps) => {
  const config = toneConfig[tone];
  const Icon = config.icon;

  return (
    <Card className={`border ${config.card} shadow-sm`}>
      <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80">
            <Icon className={`h-6 w-6 ${config.accent}`} aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-semibold ${config.accent}`}>
                {title}
              </h3>
              {statusLabel ? (
                <Chip size="sm" color={config.chipColor} variant="flat">
                  {statusLabel}
                </Chip>
              ) : null}
            </div>
            <p className="text-sm text-gray-700">{description}</p>
            {helperText ? (
              <p className="text-xs text-gray-500">{helperText}</p>
            ) : null}
          </div>
        </div>
        {actions && actions.length > 0 ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {actions.map((action) => (
              <Button
                key={action.label}
                color={action.color ?? "primary"}
                variant={action.variant ?? "solid"}
                onPress={action.onPress}
                isLoading={action.isLoading}
                isDisabled={action.isDisabled}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
};
