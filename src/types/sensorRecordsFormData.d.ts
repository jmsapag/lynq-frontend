import { AggregationType, GroupByTimeAmount, SensorDataPoint } from "./sensorDataResponse.ts";
import { Time } from "@internationalized/date";

export type SensorRecordsFormData = {
  sensorIds: number[];
  fetchedDateRange: { start: Date; end: Date } | null;
  dateRange: { start: Date; end: Date };
  hourRange: { start: Time; end: Time };
  rawData: SensorDataPoint[];
  groupBy: GroupByTimeAmount;
  aggregationType: AggregationType;
  needToFetch: boolean;
}
