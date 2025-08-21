import { axiosPrivate } from "./axiosClient";
import { ReportConfig } from "../types/reports";

export const saveReportConfig = async (config: ReportConfig) => {
  const response = await axiosPrivate.post("/report-config", config);
  return response.data;
};
