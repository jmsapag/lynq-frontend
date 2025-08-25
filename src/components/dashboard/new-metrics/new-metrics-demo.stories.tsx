import type { Meta, StoryObj } from "@storybook/react";
import { NewMetricsDemo } from "./new-metrics-demo";
import { TransformedSensorData } from "../../../types/sensorDataResponse";

// Mock data para las nuevas métricas
const mockData: TransformedSensorData = {
  timestamps: [
    "Aug 23, 18:35",
    "Aug 23, 18:55",
    "Aug 23, 19:10",
    "Aug 23, 19:25",
    "Aug 23, 19:40",
    "Aug 23, 19:55",
    "Aug 23, 20:10",
    "Aug 23, 20:25",
  ],
  in: [0, 8, 1, 5, 3, 7, 2, 4],
  out: [0, 3, 6, 2, 1, 4, 5, 3],
  returningCustomers: [5, 4, 3, 6, 2, 8, 1, 5],
  avgVisitDuration: [23.39, 23.12, 28.45, 31.67, 19.23, 25.78, 22.11, 26.89],
  outsideTraffic: [17, 30, 45, 38, 22, 41, 28, 35],
  affluence: [0, 26.67, 2.22, 13.16, 13.64, 17.07, 7.14, 11.43], // Calculated as in/outsideTraffic * 100
};

const meta: Meta<typeof NewMetricsDemo> = {
  title: "Dashboard/New Metrics Demo",
  component: NewMetricsDemo,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Demostración de las nuevas métricas implementadas en el dashboard:

- **Clientes que Retornan**: Muestra el total de clientes que han regresado al establecimiento
- **Tiempo Promedio en Local**: Tiempo promedio que los clientes permanecen en el establecimiento (en minutos)
- **Afluencia**: Porcentaje de entradas respecto al tráfico exterior (Entradas/Tráfico exterior × 100)

Todas las métricas incluyen:
- Tarjetas de métricas individuales
- Gráficos interactivos
- Compatibilidad con el sistema de drag & drop
- Soporte para exportación (PNG, PDF, CSV)
- Traducciones en inglés y español
        `,
      },
    },
  },
  argTypes: {
    groupBy: {
      control: {
        type: "select",
      },
      options: ["5min", "10min", "15min", "30min", "hour", "day", "week", "month"],
    },
    data: {
      control: false,
    },
    dateRange: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: mockData,
    groupBy: "15min",
    dateRange: {
      start: new Date("2025-08-23T18:00:00Z"),
      end: new Date("2025-08-23T21:00:00Z"),
    },
  },
};

export const HourlyGrouping: Story = {
  args: {
    data: mockData,
    groupBy: "hour",
    dateRange: {
      start: new Date("2025-08-23T18:00:00Z"),
      end: new Date("2025-08-23T21:00:00Z"),
    },
  },
};

export const DailyGrouping: Story = {
  args: {
    data: mockData,
    groupBy: "day",
    dateRange: {
      start: new Date("2025-08-20T00:00:00Z"),
      end: new Date("2025-08-25T23:59:59Z"),
    },
  },
};
