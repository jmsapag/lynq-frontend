import { Card, CardBody, Button, Chip } from "@heroui/react";

interface TrialBannerProps {
  trialDaysLeft: number;
  onUpgrade: () => void;
}

export const TrialBanner = ({ trialDaysLeft, onUpgrade }: TrialBannerProps) => {
  const isExpiringSoon = trialDaysLeft <= 7;

  return (
    <Card
      className={`mb-6 ${isExpiringSoon ? "border-warning" : "border-primary"}`}
    >
      <CardBody className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <Chip color={isExpiringSoon ? "warning" : "primary"} variant="flat">
            FREE TRIAL
          </Chip>
          <div>
            <p className="font-medium">
              {trialDaysLeft > 0
                ? `${trialDaysLeft} days left in your trial`
                : "Your trial has expired"}
            </p>
            <p className="text-sm text-default-500">
              Limited to 3 sensors and 3 months of data
            </p>
          </div>
        </div>
        <Button color="primary" variant="solid" onPress={onUpgrade}>
          Upgrade Now
        </Button>
      </CardBody>
    </Card>
  );
};
