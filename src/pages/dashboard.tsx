import { ChartCard } from "../components/dashboard/charts/chart-card.tsx";
import { BarChart } from "../components/dashboard/charts/bar-chart.tsx";
import { DashboardFilters } from "../components/dashboard/filter.tsx";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const availableSensors = ["Sensor 1", "Sensor 2", "Sensor 3", "Sensor 4"];

  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);

  const [flowData, setFlowData] = useState({
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    in: [120, 200, 150, 80, 70, 110, 130],
    out: [80, 150, 120, 60, 50, 90, 110],
  });

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setSelectedDateRange({ start: startDate, end: endDate });
  };

  const handleSensorsChange = (sensors: string[]) => {
    setSelectedSensors(sensors);
  };

  const handleRefreshData = () => {
    updateChartData();
  };

  const updateChartData = async () => {
    if (selectedDateRange && selectedSensors.length > 0) {
      try {
        setFlowData((prevData) => ({
          ...prevData,
          in: prevData.in.map((v) =>
            Math.round(v * (Math.random() * 0.5 + 0.75)),
          ),
          out: prevData.out.map((v) =>
            Math.round(v * (Math.random() * 0.5 + 0.75)),
          ),
        }));
      } catch (error) {
        console.error("Error al actualizar los datos:", error);
      }
    }
  };

  useEffect(() => {
    updateChartData();
  }, [selectedDateRange, selectedSensors]);

  return (
    <div className="space-y-6">
      <DashboardFilters
        onDateRangeChange={handleDateRangeChange}
        onSensorsChange={handleSensorsChange}
        onRefreshData={handleRefreshData}
        availableSensors={availableSensors}
      />

      <div className="grid grid-cols-1 gap-6">
        <ChartCard
          title="Flujo de Personas (In/Out)"
          translationKey="dashboard.charts.peopleFlow"
        >
          <BarChart
            data={{
              categories: flowData.categories,
              values: flowData.in.map((value, index) => ({
                in: value,
                out: flowData.out[index],
              })),
            }}
          />
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
