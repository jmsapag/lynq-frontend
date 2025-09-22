import { format } from "date-fns";
import { TimeGroupingStrategy } from "../../aggregate-time-series-service.ts";

export class MonthGroupingStrategy implements TimeGroupingStrategy {
  getGroupKey(date: Date): string {
    // Create UTC start of month to ensure consistency across timezones
    const utcStartOfMonth = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0),
    );
    return format(utcStartOfMonth, "yyyy-MM-dd'T'00:00:00'Z'");
  }
}
