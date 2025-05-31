import { format } from "date-fns";
import { TimeGroupingStrategy } from "../../useGroupData.ts";

export class ThirtyMinuteGroupingStrategy implements TimeGroupingStrategy {
  getGroupKey(date: Date): string {
    return format(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        Math.floor(date.getMinutes() / 30) * 30,
      ),
      "yyyy-MM-dd'T'HH:mm:00'Z'",
    );
  }
}
