import React, { ReactNode, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip, Button, Spinner } from "@heroui/react";
import {
  InformationCircleIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  PhotoIcon,
  TableCellsIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import {
  exportAsPng,
  exportAsPdf,
  exportAsCsv,
  formatDateRangeForFilename,
  exportAndSendByEmail,
} from "../../../utils/exportUtils";
import { useSendChartEmail } from "../../../hooks/reports/useSendChartEmail";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  translationKey?: string;
  translationParams?: Record<string, any>;
  description?: string;
  descriptionTranslationKey?: string;
  hideExport?: boolean;
  data?: Record<string, any>;
  dateRange?: { start: Date; end: Date };
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  className = "",
  translationKey,
  translationParams,
  description,
  descriptionTranslationKey,
  hideExport = false,
  data,
  dateRange,
}) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const { sendChartEmail, loading: isSending } = useSendChartEmail();

  const displayTitle = translationKey
    ? t(translationKey, translationParams)
    : title;

  const displayDescription = descriptionTranslationKey
    ? t(descriptionTranslationKey, translationParams)
    : description;

  const getFileName = () => {
    const baseFileName = displayTitle.toLowerCase().replace(/\s+/g, "_");
    if (dateRange) {
      return `${baseFileName}_${formatDateRangeForFilename(dateRange.start, dateRange.end)}`;
    }
    return baseFileName;
  };

  const handleExportPng = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setShowDropdown(false);
    try {
      setIsCapturing(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
      await exportAsPng(cardRef.current, getFileName());
    } catch (error) {
      console.error("Error exporting as PNG:", error);
    } finally {
      setIsCapturing(false);
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setShowDropdown(false);
    try {
      setIsCapturing(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
      await exportAsPdf(cardRef.current, getFileName());
    } catch (error) {
      console.error("Error exporting as PDF:", error);
    } finally {
      setIsCapturing(false);
      setIsExporting(false);
    }
  };

  const handleExportCsv = () => {
    if (!data) return;
    setIsExporting(true);
    setShowDropdown(false);
    try {
      const csvData = {
        metric: displayTitle,
        date_range: dateRange
          ? `${formatDateRangeForFilename(dateRange.start, dateRange.end)}`
          : "",
        ...data,
      };
      exportAsCsv(csvData, getFileName());
    } catch (error) {
      console.error("Error exporting as CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendByEmail = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setShowDropdown(false);
    try {
      setIsCapturing(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
      await exportAndSendByEmail(
        cardRef.current,
        getFileName(),
        sendChartEmail,
        description ?? "default-widget-type",
      );
    } catch (error) {
      console.error("Error sending chart by email:", error);
    } finally {
      setIsCapturing(false);
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-lg border border-gray-200 p-4 h-3/4 flex flex-col relative ${className}`}
    >
      {!hideExport && (
        <div
          className={`absolute top-2 right-2 z-10 ${isCapturing ? "invisible" : ""}`}
        >
          <div ref={dropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              className="w-4 h-5 rounded-md p-2 m-2 flex items-center justify-center border-1"
              isDisabled={isExporting}
              onPress={() => setShowDropdown(!showDropdown)}
              aria-label="Export options"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5 text-gray-500" />
            </Button>
            {showDropdown && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                <div className="py-1">
                  <button
                    onClick={handleExportPng}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <PhotoIcon className="h-5 w-5 mr-3 text-gray-500" />
                    {t("common.exportAsPng")}
                  </button>
                  <button
                    onClick={handleExportPdf}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <DocumentIcon className="h-5 w-5 mr-3 text-gray-500" />
                    {t("common.exportAsPdf")}
                  </button>
                  <button
                    onClick={handleExportCsv}
                    disabled={!data}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TableCellsIcon className="h-5 w-5 mr-3 text-gray-500" />
                    {t("common.exportAsCSV")}
                  </button>
                  <button
                    onClick={handleSendByEmail}
                    disabled={isSending}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-500" />
                    {isSending ? (
                      <span className="flex items-center gap-2">
                        <Spinner size="sm" className="mr-2" />
                        {t("common.sendingByEmail")}
                      </span>
                    ) : (
                      t("common.sendByEmail")
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <h3 className="text-lg font-medium text-gray-900">{displayTitle}</h3>
        {displayDescription && (
          <Tooltip
            content={displayDescription}
            className="bg-gray-800 text-white border-0 shadow-lg max-w-sm"
            classNames={{
              content: "bg-gray-800 text-white py-2 px-3 rounded-md text-sm",
            }}
          >
            <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </Tooltip>
        )}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
};
