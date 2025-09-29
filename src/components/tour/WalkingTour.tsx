import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  offset?: { x: number; y: number };
}

interface WalkingTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TourStep[];
  onComplete?: () => void;
}

interface TooltipPosition {
  top: number;
  left: number;
  placement: "top" | "bottom" | "left" | "right";
}

const WalkingTour: React.FC<WalkingTourProps> = ({
  isOpen,
  onClose,
  steps,
  onComplete,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] =
    useState<TooltipPosition | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(
    null,
  );

  const calculateTooltipPosition = useCallback(
    (
      element: Element,
      placement: "top" | "bottom" | "left" | "right" = "bottom",
      offset = { x: 0, y: 0 },
    ): TooltipPosition => {
      const rect = element.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      const padding = 16;

      let top = 0;
      let left = 0;
      let finalPlacement = placement;

      // Calculate position based on placement
      switch (placement) {
        case "top":
          top = rect.top - tooltipHeight - padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          // Check if tooltip goes above viewport
          if (top < 0) {
            finalPlacement = "bottom";
            top = rect.bottom + padding;
          }
          break;
        case "bottom":
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          // Check if tooltip goes below viewport
          if (top + tooltipHeight > window.innerHeight) {
            finalPlacement = "top";
            top = rect.top - tooltipHeight - padding;
          }
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - padding;
          // Check if tooltip goes left of viewport
          if (left < 0) {
            finalPlacement = "right";
            left = rect.right + padding;
          }
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + padding;
          // Check if tooltip goes right of viewport
          if (left + tooltipWidth > window.innerWidth) {
            finalPlacement = "left";
            left = rect.left - tooltipWidth - padding;
          }
          break;
      }

      // Ensure tooltip stays within viewport bounds
      left = Math.max(
        padding,
        Math.min(left + offset.x, window.innerWidth - tooltipWidth - padding),
      );
      top = Math.max(
        padding,
        Math.min(top + offset.y, window.innerHeight - tooltipHeight - padding),
      );

      return { top, left, placement: finalPlacement };
    },
    [],
  );

  const updateTooltipPosition = useCallback(() => {
    if (!isOpen || currentStep >= steps.length) return;

    const step = steps[currentStep];
    const element = document.querySelector(step.target);

    if (element) {
      const position = calculateTooltipPosition(
        element,
        step.placement || "bottom",
        step.offset || { x: 0, y: 0 },
      );
      setTooltipPosition(position);
      setHighlightedElement(element);

      // Scroll element into view if needed
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [isOpen, currentStep, steps, calculateTooltipPosition]);

  useEffect(() => {
    if (isOpen) {
      updateTooltipPosition();

      const handleResize = () => updateTooltipPosition();
      const handleScroll = () => updateTooltipPosition();

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen, updateTooltipPosition]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
    setCurrentStep(0);
    setHighlightedElement(null);
    setTooltipPosition(null);
  };

  const handleSkip = () => {
    onClose();
    setCurrentStep(0);
    setHighlightedElement(null);
    setTooltipPosition(null);
  };

  if (!isOpen || !tooltipPosition || currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" />

      {/* Highlight */}
      {highlightedElement && (
        <div
          className="fixed border-2 border-primary-500 rounded-lg shadow-lg z-[9999] pointer-events-none transition-all duration-300"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 4,
            left: highlightedElement.getBoundingClientRect().left - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[10000] w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Arrow */}
        <div
          className={`absolute w-3 h-3 bg-white dark:bg-gray-800 border rotate-45 ${
            tooltipPosition.placement === "top"
              ? "bottom-[-6px] left-1/2 transform -translate-x-1/2 border-r border-b border-gray-200 dark:border-gray-700"
              : tooltipPosition.placement === "bottom"
                ? "top-[-6px] left-1/2 transform -translate-x-1/2 border-l border-t border-gray-200 dark:border-gray-700"
                : tooltipPosition.placement === "left"
                  ? "right-[-6px] top-1/2 transform -translate-y-1/2 border-t border-r border-gray-200 dark:border-gray-700"
                  : "left-[-6px] top-1/2 transform -translate-y-1/2 border-b border-l border-gray-200 dark:border-gray-700"
          }`}
        />

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {currentStep + 1} / {steps.length}
              </span>
              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index <= currentStep
                        ? "bg-primary-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={handleSkip}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t(step.title)}
          </h3>

          {/* Content */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            {t(step.content)}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="light"
              size="sm"
              onPress={handleSkip}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t("tour.buttons.skip")}
            </Button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button variant="bordered" size="sm" onPress={prevStep}>
                  {t("tour.buttons.back")}
                </Button>
              )}
              <Button color="primary" size="sm" onPress={nextStep}>
                {isLastStep ? t("tour.buttons.finish") : t("tour.buttons.next")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalkingTour;
