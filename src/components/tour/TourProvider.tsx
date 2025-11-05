import React, { createContext, useContext, useState, useCallback } from "react";
import { TourStep } from "./TourConfig";

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: (steps: TourStep[]) => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
  children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);

  const startTour = useCallback((tourSteps: TourStep[]) => {
    setSteps(tourSteps);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const stopTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      } else {
        stopTour();
        return prev;
      }
    });
  }, [steps.length, stopTour]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
      }
    },
    [steps.length],
  );

  const value: TourContextType = {
    isActive,
    currentStep,
    steps,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    goToStep,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};
