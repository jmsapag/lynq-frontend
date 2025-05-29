export type SensorDataResponse = {
  location_id: number;
  location_name: string;
  data: SensorDataPoint[];
};

export type SensorDataPoint = {
  timestamp: string;
  total_count_in: number;
  total_count_out: number;
  isSelected: boolean;
};

export type TransformedSensorData = {
  timestamps: string[];
  in: number[];
  out: number[];
};

export type GroupByTimeAmount =
  | "5min"
  | "10min"
  | "15min"
  | "30min"
  | "hour"
  | "day"
  | "week"
  | "month";
export type AggregationType = "sum" | "avg" | "min" | "max";
