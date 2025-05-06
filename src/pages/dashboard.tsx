import { ChartCard } from "../components/dashboard/charts/chart-card.tsx";
import { BarChart } from "../components/dashboard/charts/bar-chart.tsx";
import { LineChart } from "../components/dashboard/charts/line-chart.tsx";
import { DashboardFilters } from "../components/dashboard/filter.tsx";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const availableSensors = ["Sensor 1", "Sensor 2", "Sensor 3", "Sensor 4"];

  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [visitors, setVisitors] = useState({
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [120, 200, 150, 80, 70, 110, 130],
  });
  const [weeklyTrend, setWeeklyTrend] = useState({
    categories: ["Week 1", "Week 2", "Week 3", "Week 4"],
    values: [400, 600, 550, 750],
  });

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setSelectedDateRange({ start: startDate, end: endDate });
  };

  const handleSensorsChange = (sensors: string[]) => {
    setSelectedSensors(sensors);
  };

  useEffect(() => {
    const updateChartData = async () => {
      if (selectedDateRange && selectedSensors.length > 0) {
        try {
          setVisitors((prevData) => ({
            ...prevData,
            values: prevData.values.map(
              (v) => v * (Math.random() * 0.5 + 0.75),
            ),
          }));

          setWeeklyTrend((prevData) => ({
            ...prevData,
            values: prevData.values.map(
              (v) => v * (Math.random() * 0.5 + 0.75),
            ),
          }));
        } catch (error) {
          console.error("Error al actualizar los datos:", error);
        }
      }
    };

    updateChartData();
  }, [selectedDateRange, selectedSensors]);

  return (
    <div className="space-y-6">
      <DashboardFilters
        onDateRangeChange={handleDateRangeChange}
        onSensorsChange={handleSensorsChange}
        availableSensors={availableSensors}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard
          title="Daily Visitors"
          translationKey="dashboard.charts.dailyVisitors"
        >
          <BarChart data={visitors} />
        </ChartCard>

        <ChartCard
          title="Weekly Trend"
          translationKey="dashboard.charts.weeklyTrend"
        >
          <LineChart data={weeklyTrend} />
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
