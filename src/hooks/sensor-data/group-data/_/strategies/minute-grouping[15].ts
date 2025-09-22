import { format } from "date-fns";
import { TimeGroupingStrategy } from "../../aggregate-time-series-service.ts";

export class FifteenMinuteGroupingStrategy implements TimeGroupingStrategy {
  getGroupKey(date: Date): string {
    return format(
      new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        Math.floor(date.getUTCMinutes() / 15) * 15,
      ),
      "yyyy-MM-dd'T'HH:mm:00'Z'",
    );
  }
}
