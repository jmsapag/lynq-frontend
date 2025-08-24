import { useState } from "react";
import { useTranslation } from "react-i18next";
import { addToast } from "@heroui/react";
import { saveReportConfig } from "../../services/reportsService.ts";
import { ReportConfig } from "../../types/reports.ts";

export const useReportConfig = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const saveConfig = async (config: ReportConfig) => {
    setIsLoading(true);
    try {
      await saveReportConfig(config);
      addToast({
        title: t("reports.toasts.saveSuccessTitle"),
        description: t("reports.toasts.saveSuccessDesc"),
        severity: "success",
        color: "success",
      });
      setIsModalOpen(false);
    } catch (error: any) {
      addToast({
        title: t("reports.toasts.saveErrorTitle"),
        description:
          error?.response?.data?.message || t("reports.toasts.saveErrorDesc"),
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
