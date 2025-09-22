import { format } from "date-fns";
import { TimeGroupingStrategy } from "../../aggregate-time-series-service.ts";

export class DayGroupingStrategy implements TimeGroupingStrategy {
  getGroupKey(date: Date): string {
    // Create UTC start of day to ensure consistency across timezones
    const utcStartOfDay = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    return format(utcStartOfDay, "yyyy-MM-dd'T'00:00:00'Z'");
  }
}
