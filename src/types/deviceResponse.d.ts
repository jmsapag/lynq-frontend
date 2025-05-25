import { sensorMetadata } from "./sensorMetadata";

export type sensorResponse = {
  id: string;
  name: string;
  sensors: sensorMetadata[];
};
