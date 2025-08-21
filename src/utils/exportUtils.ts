import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { format } from "date-fns";

export const formatDateRangeForFilename = (
  startDate: Date,
  endDate: Date,
): string => {
  return `${format(startDate, "yyyy-MM-dd")}_to_${format(endDate, "yyyy-MM-dd")}`;
};

// Export as PNG
export const exportAsPng = async (
  elementRef: HTMLElement,
  fileName: string,
): Promise<void> => {
  const canvas = await html2canvas(elementRef, {
    backgroundColor: "#ffffff",
    scale: 2, // Higher quality
  });

  canvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, `${fileName}.png`);
    }
  });
};

// Export as PDF
export const exportAsPdf = async (
  elementRef: HTMLElement,
  fileName: string,
): Promise<void> => {
  const canvas = await html2canvas(elementRef, {
    backgroundColor: "#ffffff",
    scale: 2,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
  });

  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
  pdf.save(`${fileName}.pdf`);
};

// Export as CSV
// src/utils/exportUtils.ts
// ... (keep existing code the same until exportAsCsv)

// Export as CSV
export const exportAsCsv = (
  data: Record<string, any>,
  fileName: string,
): void => {
  const escapeCSV = (value: any): string => {
    const stringValue = String(value ?? ""); // Handle null/undefined
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const rows: string[][] = [];

  rows.push(["Metric Name", data.metric || fileName]);

  if (data.date_range_start && data.date_range_end) {
    rows.push(["Period", `${data.date_range_start} to ${data.date_range_end}`]);
  } else if (data.date_range) {
    rows.push(["Period", data.date_range]);
  }

  if (data.sensors) {
    if (Array.isArray(data.sensors) && typeof data.sensors[0] === "object") {
      rows.push(["Sensors", ""]);
      rows.push(["ID", "Position/Name", "Location"]);

      data.sensors.forEach((sensor: any) => {
        rows.push([
          sensor.id.toString(),
          sensor.position || "Unknown position",
          sensor.location || "",
        ]);
      });
      rows.push([]);
    } else {
      rows.push(["Sensors", data.sensors]);
    }
  }

  // Handle chart data (categories and devices)
  if (data.categories && data.devices) {
    const header = ["Timestamp", ...data.devices.map((d: any) => d.name)];
    rows.push([]);
    rows.push(header);

    data.categories.forEach((category: string, index: number) => {
      const row = [
        category,
        ...data.devices.map((d: any) => d.values[index] ?? ""),
      ];
      rows.push(row);
    });
  } else {
    // Handle simple key-value data
    rows.push([]);
    const metricsToExclude = [
      "metric",
      "date_range",
      "date_range_start",
      "date_range_end",
      "sensors",
      "sensorDetails",
      "categories",
      "devices",
    ];
    Object.entries(data).forEach(([key, value]) => {
      if (!metricsToExclude.includes(key)) {
        const formattedKey = key
          .replace(/_/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        const unit = key === "value" ? data.unit || "" : "";
        rows.push([formattedKey, String(value), unit]);
      }
    });
  }

  // Generate CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += rows.map((row) => row.map(escapeCSV).join(",")).join("\r\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
