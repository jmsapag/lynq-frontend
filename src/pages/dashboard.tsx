import { ChartCard } from "../components/dashboard/charts/chart-card.tsx";
import { BarChart } from "../components/dashboard/charts/bar-chart.tsx";
import { DashboardFilters } from "../components/dashboard/filter.tsx";
import { useEffect, useState } from "react";
import { axiosClient } from "../services/axiosClient";

const Dashboard = () => {
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        await axiosClient.get("/");
        console.log("API Connection Test Was Successful");
      } catch (error) {
        console.error("API Connection Error:", error);
        // Add more detailed error logging
        if (error.response) {
          console.log("Error data:", error.response.data);
          console.log("Error status:", error.response.status);
        } else if (error.request) {
          console.log("Request was made but no response received");
        } else {
          console.log("Error message:", error.message);
        }
      }
    };
    testApiConnection();
  }, []);

  const availableSensors = ["Sensor 1", "Sensor 2", "Sensor 3", "Sensor 4"];

  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [selectedAggregation, setSelectedAggregation] =
    useState<string>("none");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

  const handleAggregationChange = (aggregation: string) => {
    setSelectedAggregation(aggregation);
  };

  const handleRefreshData = () => {
    setLastUpdated(new Date());
    updateChartData();
  };

  const updateChartData = async () => {
    if (selectedDateRange && selectedSensors.length > 0) {
      try {
        let multiplier = 1.0;

        switch (selectedAggregation) {
          case "sum":
            multiplier = 1.5;
            break;
          case "avg":
            multiplier = 1.0;
            break;
          case "min":
            multiplier = 0.6;
            break;
          case "max":
            multiplier = 1.8;
            break;
          default:
            multiplier = 1.0;
        }

        setFlowData((prevData) => ({
          ...prevData,
          in: prevData.in.map((v) =>
            Math.round(v * multiplier * (Math.random() * 0.5 + 0.75)),
          ),
          out: prevData.out.map((v) =>
            Math.round(v * multiplier * (Math.random() * 0.5 + 0.75)),
          ),
        }));
      } catch (error) {
        console.error("Error al actualizar los datos:", error);
      }
    }
  };

  useEffect(() => {
    updateChartData();
  }, [selectedDateRange, selectedSensors, selectedAggregation]);

  return (
    <div className="space-y-6">
      <DashboardFilters
        onDateRangeChange={handleDateRangeChange}
        onSensorsChange={handleSensorsChange}
        onAggregationChange={handleAggregationChange}
        onRefreshData={handleRefreshData}
        availableSensors={availableSensors}
        lastUpdated={lastUpdated}
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
