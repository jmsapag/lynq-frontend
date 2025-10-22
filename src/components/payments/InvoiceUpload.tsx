import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody } from "@heroui/react";
import {
  DocumentArrowUpIcon,
  DocumentCheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  uploadInvoice,
  downloadInvoice,
} from "../../services/subscriptionService";

interface InvoiceUploadProps {
  businessId: number;
  currentInvoiceFileName?: string | null;
  currentInvoiceUploadedAt?: string | null;
  onUploadSuccess?: () => void;
}

export default function InvoiceUpload({
  businessId,
  currentInvoiceFileName,
  currentInvoiceUploadedAt,
  onUploadSuccess,
}: InvoiceUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      setError(t("billing.invoice.invalidFileType"));
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError(t("billing.invoice.fileTooLarge"));
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      await uploadInvoice(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploadSuccess?.();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || t("billing.invoice.uploadError"),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!currentInvoiceFileName) return;

    try {
      setDownloading(true);
      setError(null);
      const blob = await downloadInvoice(businessId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = currentInvoiceFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || t("billing.invoice.downloadError"),
      );
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(t("common.locale"), {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  return (
    <Card className="border border-gray-200 shadow-none">
      <CardBody className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <DocumentArrowUpIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {t("billing.invoice.title")}
              </h3>
              <p className="text-sm text-gray-500">
                {t("billing.invoice.description")}
              </p>
            </div>
          </div>

          {currentInvoiceFileName && currentInvoiceUploadedAt && (
            <div className="flex items-center gap-3 rounded-lg border border-success-200 bg-success-50 p-4">
              <DocumentCheckIcon className="h-5 w-5 text-success-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-success-900">
                  {currentInvoiceFileName}
                </p>
                <p className="text-xs text-success-700">
                  {t("billing.invoice.uploadedAt", {
                    date: formatDate(currentInvoiceUploadedAt),
                  })}
                </p>
              </div>
              <Button
                size="sm"
                variant="flat"
                color="success"
                onPress={handleDownload}
                isLoading={downloading}
              >
                {t("billing.invoice.download")}
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="invoice-upload"
            />
            <label
              htmlFor="invoice-upload"
              className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-primary-400 hover:bg-primary-50"
            >
              <div className="text-center">
                <DocumentArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {t("billing.invoice.selectFile")}
                </p>
                <p className="text-xs text-gray-500">
                  {t("billing.invoice.fileRequirements")}
                </p>
              </div>
            </label>

            {selectedFile && (
              <div className="flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 p-3">
                <div className="flex items-center gap-2">
                  <DocumentCheckIcon className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-primary-700">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  color="primary"
                  onPress={handleUpload}
                  isLoading={uploading}
                >
                  {t("billing.invoice.upload")}
                </Button>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3">
                <ExclamationCircleIcon className="h-5 w-5 text-danger-600" />
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
