import { format } from "date-fns";
import { TimeGroupingStrategy } from "../../useGroupData.ts";

export class FifteenMinuteGroupingStrategy implements TimeGroupingStrategy {
  getGroupKey(date: Date): string {
    return format(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        Math.floor(date.getMinutes() / 15) * 15,
      ),
      "yyyy-MM-dd'T'HH:mm:00'Z'",
    );
  }
}
