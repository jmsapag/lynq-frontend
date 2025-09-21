export type SensorDataResponse = {
  location_id: number;
  location_name: string;
  data: SensorDataPoint[];
};

export type SensorDataPoint = {
  timestamp: string;
  total_count_in: number;
  total_count_out: number;
  outsideTraffic?: number;
  avgVisitDuration?: number;
  returningCustomer?: number;
};

export type TransformedSensorData = {
  timestamps: string[];
  in: number[];
  out: number[];
  returningCustomers: number[];
  avgVisitDuration: number[];
  outsideTraffic: number[];
  affluence: number[]; // Calculated as in/outsideTraffic
};

export type TransformedSensorDataByLocation = {
  locationId: number;
  locationName: string;
  data: TransformedSensorData;
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
