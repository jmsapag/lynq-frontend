// src/components/dashboard/layout-dashboard/LayoutDashboard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { LayoutDashboard } from './LayoutDashboard';
import { SensorRecordsFormData } from '../../../types/sensorRecordsFormData';
import { Time } from '@internationalized/date';

const meta: Meta<typeof LayoutDashboard> = {
  title: 'Dashboard/LayoutDashboard',
  component: LayoutDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive dashboard with drag-and-drop layout management using real LYNQ components and Hero UI'
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data that matches the real LYNQ dashboard format
const mockMetrics = {
  totalIn: 1247,
  totalOut: 1089,
  entryRate: 53
};

const mockChartData = {
  categories: [
    '2024-08-01 09:00', '2024-08-01 10:00', '2024-08-01 11:00', 
    '2024-08-01 12:00', '2024-08-01 13:00', '2024-08-01 14:00', 
    '2024-08-01 15:00', '2024-08-01 16:00', '2024-08-01 17:00'
  ],
  values: [
    { in: 45, out: 38 },
    { in: 67, out: 59 },
    { in: 89, out: 78 },
    { in: 123, out: 108 },
    { in: 145, out: 132 },
    { in: 167, out: 156 },
    { in: 134, out: 127 },
    { in: 98, out: 89 },
    { in: 76, out: 68 }
  ]
};

// Mock sensor data that matches TransformedSensorData format
const mockSensorData = {
  timestamps: [
    '2024-08-01 09:00', '2024-08-01 10:00', '2024-08-01 11:00', 
    '2024-08-01 12:00', '2024-08-01 13:00', '2024-08-01 14:00', 
    '2024-08-01 15:00', '2024-08-01 16:00', '2024-08-01 17:00'
  ],
  in: [45, 67, 89, 123, 145, 167, 134, 98, 76],
  out: [38, 59, 78, 108, 132, 156, 127, 89, 68]
};

// Mock form data that matches SensorRecordsFormData
const mockFormData: SensorRecordsFormData = {
  sensorIds: [1, 2, 3],
  fetchedDateRange: {
    start: new Date('2024-08-01'),
    end: new Date('2024-08-05')
  },
  dateRange: {
    start: new Date('2024-08-01'),
    end: new Date('2024-08-05')
  },
  hourRange: { 
    start: new Time(9, 0), 
    end: new Time(17, 0) 
  },
  rawData: [],
  groupBy: 'hour',
  aggregationType: 'sum',
  needToFetch: false,
};

// Rich sensor data for heatmap (simulating 24 hours x 7 days)
const mockHeatmapSensorData = {
  timestamps: mockSensorData.timestamps,
  in: mockSensorData.in,
  out: mockSensorData.out,
  // Additional data for heatmap visualization
  heatmapData: Array.from({ length: 7 }, (_, day) => 
    Array.from({ length: 24 }, (_, hour) => ({
      day,
      hour,
      value: Math.floor(Math.random() * 200) + 50
    }))
  ).flat()
};

export const RealDashboardLayout: Story = {
  args: {
    metrics: mockMetrics,
    chartData: mockChartData,
    sensorData: mockHeatmapSensorData,
    sensorRecordsFormData: mockFormData,
    isLoading: false,
    hasError: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Real LYNQ dashboard layout with actual components and data structures. Try switching layouts and enabling edit mode to drag widgets around.'
      }
    }
  }
};

export const GridLayout: Story = {
  args: {
    ...RealDashboardLayout.args,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard using the 2x2 grid layout schema'
      }
    }
  }
};

export const ColumnsLayout: Story = {
  args: {
    ...RealDashboardLayout.args,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard using the three-column layout schema'
      }
    }
  }
};

export const SidebarLayout: Story = {
  args: {
    ...RealDashboardLayout.args,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard using the sidebar layout with metrics on the side'
      }
    }
  }
};

export const LoadingDashboard: Story = {
  args: {
    metrics: { totalIn: 0, totalOut: 0, entryRate: 0 },
    chartData: { categories: [], values: [] },
    sensorData: mockSensorData,
    sensorRecordsFormData: mockFormData,
    isLoading: true,
    hasError: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard in loading state showing spinner'
      }
    }
  }
};

export const ErrorDashboard: Story = {
  args: {
    metrics: { totalIn: 0, totalOut: 0, entryRate: 0 },
    chartData: { categories: [], values: [] },
    sensorData: mockSensorData,
    sensorRecordsFormData: mockFormData,
    isLoading: false,
    hasError: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard in error state'
      }
    }
  }
};

export const EmptyDataDashboard: Story = {
  args: {
    metrics: { totalIn: 0, totalOut: 0, entryRate: 0 },
    chartData: { categories: [], values: [] },
    sensorData: { timestamps: [], in: [], out: [] },
    sensorRecordsFormData: mockFormData,
    isLoading: false,
    hasError: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard with no data - shows empty state messages in charts'
      }
    }
  }
};

export const HighTrafficDashboard: Story = {
  args: {
    metrics: {
      totalIn: 5847,
      totalOut: 5234,
      entryRate: 53
    },
    chartData: {
      categories: mockChartData.categories,
      values: mockChartData.values.map(item => ({
        in: item.in * 4,
        out: item.out * 4
      }))
    },
    sensorData: {
      ...mockHeatmapSensorData,
      in: mockSensorData.in.map(val => val * 4),
      out: mockSensorData.out.map(val => val * 4)
    },
    sensorRecordsFormData: mockFormData,
    isLoading: false,
    hasError: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard with high traffic data to test component scaling'
      }
    }
  }
};
