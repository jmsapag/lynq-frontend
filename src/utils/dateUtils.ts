import { format } from "date-fns";

export const getFirstFetchedDateRange = () => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  return {
    start,
    end,
  };
};

export const formatDateForExport = (date: Date) => {
  return format(date, "yyyy-MM-dd");
};
