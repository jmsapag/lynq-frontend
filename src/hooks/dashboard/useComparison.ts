import { useState, useMemo } from "react";
import {
  calculateComparisonPeriods,
  type DateRange,
  type ComparisonPeriods,
} from "../../utils/comparisonUtils";

export interface UseComparisonReturn {
  isComparisonEnabled: boolean;
  setIsComparisonEnabled: (enabled: boolean) => void;
  comparisonPeriods: ComparisonPeriods | null;
  toggleComparison: () => void;
}

/**
 * Hook to manage comparison state and calculate comparison periods
 */
export const useComparison = (
  currentDateRange: DateRange,
): UseComparisonReturn => {
  const [isComparisonEnabled, setIsComparisonEnabled] = useState(false);

  const comparisonPeriods = useMemo(() => {
    if (!isComparisonEnabled) {
      return null;
    }

    return calculateComparisonPeriods(currentDateRange);
  }, [
    isComparisonEnabled,
    currentDateRange.start.getTime(),
    currentDateRange.end.getTime(),
  ]);

  const toggleComparison = () => {
    setIsComparisonEnabled(!isComparisonEnabled);
  };

  return {
    isComparisonEnabled,
    setIsComparisonEnabled,
    comparisonPeriods,
    toggleComparison,
  };
};
