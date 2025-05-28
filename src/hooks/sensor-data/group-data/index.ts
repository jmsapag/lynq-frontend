import { FiveMinuteGroupingStrategy } from "./_/strategies/minute-grouping[5].ts";
import { TenMinuteGroupingStrategy } from "./_/strategies/minute-grouping[10].ts";
import { FifteenMinuteGroupingStrategy } from "./_/strategies/minute-grouping[15].ts";
import { ThirtyMinuteGroupingStrategy } from "./_/strategies/minute-grouping[30].ts";
import { HourGroupingStrategy } from "./_/strategies/hour-grouping.ts";
import { DayGroupingStrategy } from "./_/strategies/day-grouping.ts";
import { WeekGroupingStrategy } from "./_/strategies/week-grouping.ts";
import { MonthGroupingStrategy } from "./_/strategies/month-grouping.ts";
import { TimeGroupingStrategy } from "./aggregate-time-series-service.ts";
import { GroupByTimeAmount } from "../../../types/sensorDataResponse.ts";

export const timeGroupingStrategies: Record<
  GroupByTimeAmount,
  TimeGroupingStrategy
> = {
  "5min": new FiveMinuteGroupingStrategy(),
  "10min": new TenMinuteGroupingStrategy(),
  "15min": new FifteenMinuteGroupingStrategy(),
  "30min": new ThirtyMinuteGroupingStrategy(),
  hour: new HourGroupingStrategy(),
  day: new DayGroupingStrategy(),
  week: new WeekGroupingStrategy(),
  month: new MonthGroupingStrategy(),
};
