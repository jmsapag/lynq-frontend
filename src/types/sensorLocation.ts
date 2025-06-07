import { sensorMetadata } from './sensorMetadata';

export interface SensorLocation {
  id: string;
  name: string;
  sensors: sensorMetadata[];
}
