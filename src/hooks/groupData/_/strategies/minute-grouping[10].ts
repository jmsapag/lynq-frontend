import { format } from "date-fns";
import { TimeGroupingStrategy } from "../../useGroupData.ts";

export class TenMinuteGroupingStrategy implements TimeGroupingStrategy {
  getGroupKey(date: Date): string {
    return format(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        Math.floor(date.getMinutes() / 10) * 10,
      ),
      "yyyy-MM-dd'T'HH:mm:00'Z'",
    );
  }
}
