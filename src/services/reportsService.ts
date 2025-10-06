import { axiosPrivate } from "./axiosClient";
import {
  ReportConfig,
  ReportsResponse,
  ReportLayoutConfiguration,
} from "../types/reports";

// Fetch list of saved report layout configurations
export const getReports = async (): Promise<ReportsResponse> => {
  const res = await axiosPrivate.get(`/reports`);
  return res.data;
};

// Fetch a single configuration by layout/report id
export const getReportConfigurationById = async (
  reportId: string | undefined,
): Promise<ReportLayoutConfiguration | null> => {
  if (!reportId) return null;
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
