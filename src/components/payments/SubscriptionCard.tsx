import type React from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import type { SVGProps } from "react";

export interface SubscriptionFeature {
  icon: React.ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description?: string;
}

export interface SubscriptionCardAction {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  variant?: "solid" | "bordered" | "light";
  color?:
    | "primary"
    | "secondary"
    | "default"
    | "success"
    | "warning"
    | "danger";
}

interface SubscriptionValueBlock {
  label: string;
  value: string;
  helper?: string;
}

interface SubscriptionCardProps {
  title: string;
  subtitle?: string;
  pricePerSensor: SubscriptionValueBlock;
  estimatedTotal: SubscriptionValueBlock;
  sensorSummary: string;
  trialBadge?: string;
  features: SubscriptionFeature[];
  primaryAction: SubscriptionCardAction;
  secondaryAction?: SubscriptionCardAction;
}

export const SubscriptionCard = ({
  title,
  subtitle,
  pricePerSensor,
  estimatedTotal,
  sensorSummary,
  trialBadge,
  features,
  primaryAction,
  secondaryAction,
}: SubscriptionCardProps) => {
  return (
    <Card className="w-full max-w-4xl border border-primary-100 bg-white/90 backdrop-blur shadow-xl transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl">
      <CardBody className="space-y-8 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            {trialBadge ? (
              <Chip color="primary" size="sm" variant="flat">
                {trialBadge}
              </Chip>
            ) : null}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
              {subtitle ? (
                <p className="text-base text-gray-500">{subtitle}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 text-right sm:grid-cols-2 md:text-right">
            <div className="rounded-xl border border-primary-100 bg-primary-50/60 px-6 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-primary-500">
                {pricePerSensor.label}
              </p>
              <p className="text-3xl font-extrabold text-primary-600">
                {pricePerSensor.value}
              </p>
              {pricePerSensor.helper ? (
                <p className="mt-1 text-xs text-primary-500/80">
                  {pricePerSensor.helper}
                </p>
              ) : null}
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                {estimatedTotal.label}
              </p>
              <p className="text-3xl font-extrabold text-gray-900">
                {estimatedTotal.value}
              </p>
              {estimatedTotal.helper ? (
                <p className="mt-1 text-xs text-gray-500">
                  {estimatedTotal.helper}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title: featureTitle, description }) => (
            <div
              key={featureTitle}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white/60 p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {featureTitle}
                </p>
                {description ? (
                  <p className="text-sm text-gray-500">{description}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">{sensorSummary}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {secondaryAction ? (
              <Button
                color={secondaryAction.color ?? "default"}
                variant={secondaryAction.variant ?? "bordered"}
                onPress={secondaryAction.onPress}
                isDisabled={secondaryAction.isDisabled}
              >
                {secondaryAction.label}
              </Button>
            ) : null}
            <Button
              color={primaryAction.color ?? "primary"}
              onPress={primaryAction.onPress}
              isLoading={primaryAction.isLoading}
              isDisabled={primaryAction.isDisabled}
              variant={primaryAction.variant ?? "solid"}
              className="px-8 shadow-md"
            >
              {primaryAction.label}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
