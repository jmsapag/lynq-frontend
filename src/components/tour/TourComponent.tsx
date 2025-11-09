import React, { useEffect, useRef } from "react";
import { Button } from "@heroui/react";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useTour } from "./TourProvider";

export const TourComponent: React.FC = () => {
  const { isActive, currentStep, steps, nextStep, prevStep, stopTour } =
    useTour();
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    const currentStepData = steps[currentStep];
    if (!currentStepData) return;

    const targetElement = document.querySelector(currentStepData.target);
    if (!targetElement) return;

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      if (overlayRef.current) {
        overlayRef.current.style.top = `${rect.top + scrollTop}px`;
        overlayRef.current.style.left = `${rect.left + scrollLeft}px`;
        overlayRef.current.style.width = `${rect.width}px`;
        overlayRef.current.style.height = `${rect.height}px`;
      }

      if (tooltipRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        let top = rect.top + scrollTop;
        let left = rect.left + scrollLeft;

        const offset = currentStepData.offset || { x: 0, y: 0 };

        switch (currentStepData.placement) {
          case "top":
            top = rect.top + scrollTop - tooltipRect.height - 10 + offset.y;
            left =
              rect.left +
              scrollLeft +
              rect.width / 2 -
              tooltipRect.width / 2 +
              offset.x;
            break;
          case "bottom":
            top = rect.bottom + scrollTop + 10 + offset.y;
            left =
              rect.left +
              scrollLeft +
              rect.width / 2 -
              tooltipRect.width / 2 +
              offset.x;
            break;
          case "left":
            top =
              rect.top +
              scrollTop +
              rect.height / 2 -
              tooltipRect.height / 2 +
              offset.y;
            left = rect.left + scrollLeft - tooltipRect.width - 10 + offset.x;
            break;
          case "right":
            top =
              rect.top +
              scrollTop +
              rect.height / 2 -
              tooltipRect.height / 2 +
              offset.y;
            left = rect.right + scrollLeft + 10 + offset.x;
            break;
          default:
            top = rect.bottom + scrollTop + 10 + offset.y;
            left =
              rect.left +
              scrollLeft +
              rect.width / 2 -
              tooltipRect.width / 2 +
              offset.x;
        }

        // Ensure tooltip stays within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left < 10) left = 10;
        if (left + tooltipRect.width > viewportWidth - 10) {
          left = viewportWidth - tooltipRect.width - 10;
        }
        if (top < 10) top = 10;
        if (top + tooltipRect.height > viewportHeight - 10) {
          top = viewportHeight - tooltipRect.height - 10;
        }

        tooltipRef.current.style.top = `${top}px`;
        tooltipRef.current.style.left = `${left}px`;
      }

      // Scroll to element if needed
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    };

    // Initial position
    updatePosition();

    // Update position on scroll and resize
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isActive, currentStep, steps]);

  if (!isActive || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  if (!currentStepData) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" />

      {/* Highlight overlay */}
      <div
        ref={overlayRef}
        className="fixed z-[9999] pointer-events-none"
        style={{
          boxShadow:
            "0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)",
          borderRadius: "4px",
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] bg-white rounded-lg shadow-xl border p-4 max-w-sm"
        style={{ minWidth: "300px" }}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentStepData.title}
          </h3>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={stopTour}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-gray-600 mb-4">{currentStepData.content}</p>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {currentStep + 1} of {steps.length}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="bordered"
              onPress={prevStep}
              isDisabled={currentStep === 0}
              startContent={<ChevronLeftIcon className="h-4 w-4" />}
            >
              Previous
            </Button>
            <Button
              size="sm"
              color="primary"
              onPress={nextStep}
              endContent={
                currentStep < steps.length - 1 ? (
                  <ChevronRightIcon className="h-4 w-4" />
                ) : null
              }
            >
              {currentStep < steps.length - 1 ? "Next" : "Finish"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
