import { format, startOfDay } from "date-fns";
import { TimeGroupingStrategy } from "../../aggregate-time-series-service.ts";

export class DayGroupingStrategy implements TimeGroupingStrategy {
  getGroupKey(date: Date): string {
    return format(startOfDay(date), "yyyy-MM-dd'T'00:00:00'Z'");
  }
}
