import { format, startOfMonth } from "date-fns";
import { TimeGroupingStrategy } from "../../aggregate-time-series-service.ts";

export class MonthGroupingStrategy implements TimeGroupingStrategy {
  getGroupKey(date: Date): string {
    return format(startOfMonth(date), "yyyy-MM-dd'T'00:00:00'Z'");
  }
}
