export type locationAggregatedRecord = {
  location_id: number;
  location_name: string;
  data: aggregatedRecord[];
};

export type aggregatedRecord = {
  timestamp: Date;
  total_count_in: number;
  total_count_out: number;
};
