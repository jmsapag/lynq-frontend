export interface DeviceResponse {
  id: number;
  name: string;
  sensors: {
    id: number;
    position: string;
  }[];
} 