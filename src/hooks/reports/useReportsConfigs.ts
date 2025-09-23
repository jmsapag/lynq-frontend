import { useState } from "react";
import { useTranslation } from "react-i18next";
import { addToast } from "@heroui/react";
import { saveReportConfig } from "../../services/reportsService.ts";
import { ReportConfig } from "../../types/reports.ts";
import { useLanguage } from "../useLanguage";

export const useReportConfig = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { getCurrentLanguage } = useLanguage();

  const saveConfig = async (config: ReportConfig) => {
    setIsLoading(true);
    try {
      const currentLanguage = getCurrentLanguage();
      const configWithLanguage = {
        ...config,
        language: currentLanguage,
      };

      await saveReportConfig(configWithLanguage);
      addToast({
        title: t("reports.toasts.saveSuccessTitle"),
        description: t("reports.toasts.saveSuccessDesc"),
        severity: "success",
        color: "success",
      });
      setIsModalOpen(false);
    } catch (error: any) {
      // Handle timezone validation errors specifically
      const errorMessage =
        error?.response?.data?.message || t("reports.toasts.saveErrorDesc");
      const isTimezoneError =
        error?.response?.status === 400 &&
        (errorMessage.toLowerCase().includes("timezone") ||
          errorMessage.toLowerCase().includes("invalid"));

      addToast({
        title: isTimezoneError
          ? t("reports.toasts.timezoneErrorTitle", "Invalid Timezone")
          : t("reports.toasts.saveErrorTitle"),
        description: errorMessage,
        severity: "danger",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    saveConfig,
    isLoading,
  };
};
