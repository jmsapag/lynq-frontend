import { format, startOfWeek } from "date-fns";
import { TimeGroupingStrategy } from "../../aggregate-time-series-service.ts";

export class WeekGroupingStrategy implements TimeGroupingStrategy {
  getGroupKey(date: Date): string {
    return format(startOfWeek(date), "yyyy-MM-dd'T'00:00:00'Z'");
  }
}
