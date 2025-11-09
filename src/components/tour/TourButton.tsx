import React from "react";
import { Button } from "@heroui/react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { useTour } from "./TourProvider";
import {
  getDashboardTourSteps,
  getSidebarTourSteps,
  getFullAppTourSteps,
} from "./TourConfig";
import { useTranslation } from "react-i18next";

interface TourButtonProps {
  type?: "dashboard" | "sidebar" | "full";
  className?: string;
}

export const TourButton: React.FC<TourButtonProps> = ({
  type = "full",
  className = "",
}) => {
  const { startTour } = useTour();
  const { t } = useTranslation();

  const handleStartTour = () => {
    let steps;
    switch (type) {
      case "dashboard":
        steps = getDashboardTourSteps(t);
        break;
      case "sidebar":
        steps = getSidebarTourSteps(t);
        break;
      case "full":
      default:
        steps = getFullAppTourSteps(t);
        break;
    }
    startTour(steps);
  };

  return (
    <Button
      size="sm"
      variant="bordered"
      onPress={handleStartTour}
      startContent={<QuestionMarkCircleIcon className="h-4 w-4" />}
      className={className}
    >
      Start Tour
    </Button>
  );
};
