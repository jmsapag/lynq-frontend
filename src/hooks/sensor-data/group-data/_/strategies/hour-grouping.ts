import { format } from "date-fns";
import { TimeGroupingStrategy } from "../../aggregate-time-series-service.ts";

export class HourGroupingStrategy implements TimeGroupingStrategy {
  getGroupKey(date: Date): string {
    return format(
      new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
      ),
      "yyyy-MM-dd'T'HH:00:00'Z'",
    );
  }
}
