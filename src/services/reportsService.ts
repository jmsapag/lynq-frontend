import { axiosPrivate } from "./axiosClient";
import { ReportConfig } from "../types/reports";

export const saveReportConfig = async (config: ReportConfig) => {
  console.log({ config });
  const response = await axiosPrivate.post("/report-config", { config });
  return response.data;
};

export const getTimezones = async (): Promise<string[]> => {
  const response = await axiosPrivate.get("/report-config/timezones");
  return response.data;
};
