import { useState, useEffect, useCallback } from "react";

const TOUR_STORAGE_KEY = "lynq_dashboard_tour_completed";

export const useTour = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  useEffect(() => {
    // Check if user is new (tour not completed)
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted) {
      // Delay tour start to ensure components are rendered
      const timer = setTimeout(() => {
        setIsTourOpen(true);
        setTourStepIndex(0);
      }, 1500); // Increased delay to ensure everything is loaded
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = useCallback(() => {
    setTourStepIndex(0);
    setIsTourOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setIsTourOpen(false);
    setTourStepIndex(0);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
  }, []);

  const skipTour = useCallback(() => {
    setIsTourOpen(false);
    setTourStepIndex(0);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
  }, []);

  const setStepIndex = useCallback((index: number) => {
    setTourStepIndex(index);
  }, []);

  return {
    isTourOpen,
    tourStepIndex,
    startTour,
    closeTour,
    skipTour,
    setTourStepIndex: setStepIndex,
  };
};
