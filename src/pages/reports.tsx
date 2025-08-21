import { Button } from "@heroui/react";
import { useTranslation } from "react-i18next";
import ReportConfigModal from "../components/reports/ReportsConfigModal.tsx";
import { useReportConfig } from "../hooks/reports/useReportsConfigs.ts";

const ReportsPage = () => {
  const { t } = useTranslation();
  const { isModalOpen, openModal, closeModal, saveConfig, isLoading } =
    useReportConfig();

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold"></h1>
        <Button onPress={openModal}>{t("reports.configure")}</Button>
      </div>

      <ReportConfigModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={saveConfig}
        isLoading={isLoading}
      />
    </>
  );
};

export default ReportsPage;
