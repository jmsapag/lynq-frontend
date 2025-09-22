import { format } from "date-fns";
import { TimeGroupingStrategy } from "../../aggregate-time-series-service.ts";

export class WeekGroupingStrategy implements TimeGroupingStrategy {
  getGroupKey(date: Date): string {
    // Calculate UTC start of week (Sunday = 0)
    const dayOfWeek = date.getUTCDay();
    const utcStartOfWeek = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate() - dayOfWeek,
        0,
        0,
        0,
        0,
      ),
    );
    return format(utcStartOfWeek, "yyyy-MM-dd'T'00:00:00'Z'");
  }
}
