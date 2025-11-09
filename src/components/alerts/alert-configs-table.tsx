import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Tooltip,
} from "@heroui/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { AlertConfig, AlertMetric } from "../../types/alert-config";

interface AlertConfigsTableProps {
  configs: AlertConfig[];
  onEdit: (config: AlertConfig) => void;
  onDelete: (configId: number) => void;
  loading: boolean;
}

const metricLabels: Record<AlertMetric, string> = {
  [AlertMetric.SUM_IN_OUT]: "High Traffic",
  [AlertMetric.TOTAL_IN]: "High Entry",
  [AlertMetric.TOTAL_OUT]: "High Exit",
  [AlertMetric.NO_DATA]: "Silent Sensor",
  [AlertMetric.ANOMALY]: "Anomaly",
};

export const AlertConfigsTable: React.FC<AlertConfigsTableProps> = ({
  configs,
  onEdit,
  onDelete,
  loading,
}) => {
  return (
    <Table aria-label="Alert Configurations Table">
      <TableHeader>
        <TableColumn>Title</TableColumn>
        <TableColumn>Metric</TableColumn>
        <TableColumn>Condition</TableColumn>
        <TableColumn>Threshold</TableColumn>
        <TableColumn>Interval</TableColumn>
        <TableColumn>Grace Period</TableColumn>
        <TableColumn>Debounce</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody
        items={configs}
        isLoading={loading}
        emptyContent="No alert configurations found for this location."
      >
        {(item) => (
          <TableRow key={item.id}>
            <TableCell>{item.title}</TableCell>
            <TableCell>
              <Chip size="sm" variant="flat">
                {metricLabels[item.metric] || item.metric}
              </Chip>
            </TableCell>
            <TableCell>{item.condition}</TableCell>
            <TableCell>{item.threshold}</TableCell>
            <TableCell>{item.intervalMinutes} min</TableCell>
            <TableCell>{item.graceMinutes} min</TableCell>
            <TableCell>{item.debounceMinutes} min</TableCell>
            <TableCell className="flex gap-2">
              <Tooltip content="Edit">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={() => onEdit(item)}
                >
                  <PencilIcon className="h-5 w-5" />
                </Button>
              </Tooltip>
              <Tooltip content="Delete">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  color="danger"
                  onPress={() => onDelete(item.id)}
                >
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </Tooltip>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
