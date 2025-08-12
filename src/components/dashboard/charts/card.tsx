import { useTranslation } from "react-i18next";
import { Tooltip, Button } from "@heroui/react";
import {
  InformationCircleIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  PhotoIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { useRef, useState, useEffect } from "react";
import {
  exportAsPng,
  exportAsPdf,
  exportAsCsv,
  formatDateRangeForFilename,
} from "../../../utils/exportUtils";

interface SensorDataCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
  translationKey?: string;
  unit?: string;
  translationParams?: Record<string, any>;
  description?: string;
  descriptionTranslationKey?: string;
  dateRange?: { start: Date; end: Date };
  data?: Record<string, any>;
}

export const SensorDataCard: React.FC<SensorDataCardProps> = ({
  title,
  value,
  icon,
  className = "",
  translationKey,
  unit = "",
  translationParams,
  description,
  descriptionTranslationKey,
  dateRange,
  data,
}) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const exportButtonRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const displayTitle = translationKey
    ? t(translationKey, translationParams)
    : title;

  const displayDescription = descriptionTranslationKey
    ? t(descriptionTranslationKey, translationParams)
    : description;

  // Get filename based on metric name and date range
  const getFileName = () => {
    const baseFileName = displayTitle.toLowerCase().replace(/\s+/g, "_");
    if (dateRange) {
      return `${baseFileName}_${formatDateRangeForFilename(dateRange.start, dateRange.end)}`;
    }
    return baseFileName;
  };

  // Export handlers with clean card export
  const handleExportPng = async () => {
    if (!cardRef.current || !exportButtonRef.current) return;
    setIsExporting(true);
    setShowDropdown(false);

    try {
      // Hide export UI during capture
      setIsCapturing(true);

      // Wait for state update and rerender
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
    if (!cardRef.current || !exportButtonRef.current) return;
    setIsExporting(true);
    setShowDropdown(false);

    try {
      // Hide export UI during capture
      setIsCapturing(true);

      // Wait for state update and rerender
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
    setIsExporting(true);
    setShowDropdown(false);

    try {
      const csvData = {
        metric: displayTitle,
        value: value.toString().replace(/,/g, ""),
        unit: unit,
        ...(data || {}),
        date_range: dateRange
          ? `${formatDateRangeForFilename(dateRange.start, dateRange.end)}`
          : "",
      };

      exportAsCsv(csvData, getFileName());
    } catch (error) {
      console.error("Error exporting as CSV:", error);
    } finally {
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
      className={`bg-white rounded-lg border border-gray-200 relative ${className}`}
    >
      {/* Export dropdown - hidden during capture */}
      <div
        ref={exportButtonRef}
        className={`absolute top-2 right-2 ${isCapturing ? "invisible" : ""}`}
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
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
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
                  className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <TableCellsIcon className="h-5 w-5 mr-3 text-gray-500" />
                  {t("common.exportAsCSV")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between p-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-600">{displayTitle}</p>
            {displayDescription && (
              <Tooltip
                content={displayDescription}
                className="bg-gray-800 text-white border-0 shadow-lg max-w-sm"
                classNames={{
                  content:
                    "bg-gray-800 text-white py-2 px-3 rounded-md text-sm",
                }}
              >
                <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </Tooltip>
            )}
          </div>
          <p className="text-xl font-semibold mt-1">
            {value}{" "}
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </p>
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
};
