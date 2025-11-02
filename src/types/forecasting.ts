export interface ForecastInterval {
  timestamp: string;
  p10: number;
  p50: number;
  p90: number;
  mean: number;
}

export interface ForecastResponse {
  timestamps: string[];
  intervals: ForecastInterval[];
  modelType: string;
  trainedAt: string;
  dataPointsUsed: number;
}

export type ForecastGranularity = 30 | 60 | 360 | 1440;

export interface ForecastRequest {
  granularity: ForecastGranularity;
  locationId?: number;
}

export interface ModelStatus {
  has_trained_models: boolean;
  available_granularities: number[];
  last_training: string | null;
  model_count: number;
}

export interface TrainingResponse {
  message: string;
  trained_models: number;
  granularities: number[];
  training_time: string;
}
