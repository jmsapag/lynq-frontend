import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Select,
  SelectItem,
  Input,
  addToast,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useManualSubscriptions } from "../hooks/payments/useSubscriptionEvents";
import { getUserRoleFromToken } from "../hooks/auth/useAuth.ts";

const SubscriptionEventsFeed = () => {
  const { t } = useTranslation();
  const userRole = getUserRoleFromToken();
  const isLynqTeam = userRole === "LYNQ_TEAM";

  const [filters, setFilters] = useState({
    businessId: undefined as number | undefined,
    status: "",
  });

  const { subscriptions, loading, error } = useManualSubscriptions(filters);

  useEffect(() => {
    if (error) {
      addToast({
        title: t("common.error"),
        description: t("subscriptions.events.loadingError"),
        severity: "danger",
        color: "danger",
      });
    }
  }, [error, t]);

  const statusOptions = [
    { key: "", label: t("subscriptions.events.allStatuses") },
    { key: "active", label: t("subscriptions.events.active") },
    { key: "payment_due", label: "Payment Due" },
    { key: "pending_approval", label: "Pending Approval" },
    { key: "blocked", label: "Blocked" },
  ];

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, any> = {
      active: "success",
      payment_due: "warning",
      pending_approval: "primary",
      blocked: "danger",
    };
    return colorMap[status] || "default";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amountCents: number) => {
    return `€${(amountCents / 100).toFixed(2)}`;
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "businessId") {
      setFilters((prev) => ({
        ...prev,
        businessId: value ? parseInt(value, 10) : undefined,
      }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const clearFilters = () => {
    setFilters({ businessId: undefined, status: "" });
  };

  const sortedSubscriptions = Array.isArray(subscriptions)
    ? subscriptions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    : [];

  const hasActiveFilters =
    filters.businessId !== undefined ||
    (filters.status && filters.status !== "");

  return (
    <div className="w-full mx-1">
      <div className="flex justify-end items-center mb-4 gap-4">
        {isLynqTeam && (
          <Input
            placeholder={t("subscriptions.events.businessIdFilter")}
            value={filters.businessId?.toString() || ""}
            onChange={(e) => handleFilterChange("businessId", e.target.value)}
            size="sm"
            className="w-48"
            type="number"
          />
        )}

        <Select
          placeholder={t("subscriptions.events.statusFilter")}
          selectedKeys={filters.status ? [filters.status] : []}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0] as string;
            handleFilterChange("status", selectedKey || "");
          }}
          size="sm"
          className="w-48"
        >
          {statusOptions.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>

        {hasActiveFilters && (
          <Button size="sm" variant="bordered" onPress={clearFilters}>
            {t("subscriptions.events.clearFilters")}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <Card className="w-full">
            <CardBody className="text-center py-8">
              <p className="text-gray-500">{t("common.loading")}</p>
            </CardBody>
          </Card>
        ) : sortedSubscriptions.length > 0 ? (
          <Table aria-label="Manual subscriptions table">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>Business ID</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>Amount</TableColumn>
              <TableColumn>Next Expiration</TableColumn>
              <TableColumn>Created At</TableColumn>
            </TableHeader>
            <TableBody>
              {sortedSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>{subscription.id}</TableCell>
                  <TableCell>{subscription.businessId}</TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(subscription.status)}
                      variant="flat"
                      size="sm"
                    >
                      {subscription.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {formatAmount(subscription.priceAmount)}
                  </TableCell>
                  <TableCell>
                    {formatDate(subscription.nextExpirationDate)}
                  </TableCell>
                  <TableCell>{formatDate(subscription.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Card className="w-full">
            <CardBody className="text-center py-8">
              <p className="text-gray-500">
                {hasActiveFilters
                  ? t("subscriptions.events.noEventsFiltered")
                  : t("subscriptions.events.noEventsAvailable")}
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      {sortedSubscriptions.length > 0 && (
        <div className="text-sm text-default-500 text-center mt-4">
          {sortedSubscriptions.length}{" "}
          {sortedSubscriptions.length === 1 ? "subscription" : "subscriptions"}
        </div>
      )}
    </div>
  );
};

export default SubscriptionEventsFeed;
