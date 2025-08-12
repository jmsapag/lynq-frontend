import React from "react";
import { Spinner } from "@heroui/react";
import { useTranslation } from "react-i18next";

interface LoadingStateProps {
  isLoading: boolean;
  hasError: string | null;
  height?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  hasError,
  height = "h-64",
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${height}`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center ${height} text-red-500`}
      >
        {t("common.error")}
      </div>
    );
  }

  return null;
};
