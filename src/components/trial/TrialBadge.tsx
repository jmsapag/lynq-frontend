import { Chip, Tooltip } from "@heroui/react";

interface TrialBadgeProps {
  count: number;
  limit: number;
  label: string;
}

export const TrialBadge = ({ count, limit, label }: TrialBadgeProps) => {
  const isAtLimit = count >= limit;

  return (
    <Tooltip content={`Trial limit: ${limit} ${label.toLowerCase()}`}>
      <Chip color={isAtLimit ? "danger" : "warning"} variant="flat" size="sm">
        {count}/{limit} {label}
      </Chip>
    </Tooltip>
  );
};
