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
export const exportAsCsv = (
  data: Record<string, any>,
  fileName: string,
): void => {
  let csvContent = "data:text/csv;charset=utf-8,";

  const headers = Object.keys(data);
  csvContent += headers.join(",") + "\r\n";

  const values = Object.values(data);
  csvContent += values.join(",");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
