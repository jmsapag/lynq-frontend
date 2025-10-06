import { axiosPrivate } from "./axiosClient";
import { ReportConfig } from "../types/reports";
export const getReports = async (page: number = 1) => {
  // Ajusta la URL según el endpoint real
  const res = await axiosPrivate.get(`/reports?page=${page}`);
  return res.data;
};

export const getReportById = async (reportId: string | undefined) => {
  if (!reportId) return null;
  // Ajusta la URL según el endpoint real
  const res = await axiosPrivate.get(`/reports/${reportId}`);
  return res.data;
};
export const saveReportConfig = async (config: ReportConfig) => {
  console.log({ config });
  const response = await axiosPrivate.post("/report-config", { config });
  return response.data;
};

export const getTimezones = async (): Promise<string[]> => {
  const response = await axiosPrivate.get("/report-config/timezones");
  return response.data;
};
