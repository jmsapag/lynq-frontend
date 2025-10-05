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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import {
  useAllSubscriptions,
  useUpdateManualSubscription,
  UnifiedSubscription,
} from "../hooks/payments/useSubscriptionEvents";
import { getUserRoleFromToken } from "../hooks/auth/useAuth.ts";
import { PencilIcon } from "@heroicons/react/24/outline";

const SubscriptionEventsFeed = () => {
  const { t } = useTranslation();
  const userRole = getUserRoleFromToken();
  const isLynqTeam = userRole === "LYNQ_TEAM";
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [filters, setFilters] = useState({
    businessId: undefined as number | undefined,
    status: "",
  });

  const [selectedSubscription, setSelectedSubscription] =
    useState<UnifiedSubscription | null>(null);
  const [editForm, setEditForm] = useState({
    priceAmount: "",
    status: "",
    nextExpirationDate: "",
  });

  const { subscriptions, loading, error, refetch } =
    useAllSubscriptions(filters);
  const { updateSubscription, loading: updateLoading } =
    useUpdateManualSubscription();

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
    { key: "canceled", label: "Canceled" },
    { key: "incomplete", label: "Incomplete" },
    { key: "trialing", label: "Trialing" },
  ];

  const editStatusOptions = [
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
      canceled: "default",
      incomplete: "warning",
      trialing: "primary",
    };
    return colorMap[status] || "default";
  };

  const getTypeColor = (type: string) => {
    return type === "manual" ? "secondary" : "primary";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amountCents: number) => {
    return `€${(amountCents / 100).toFixed(2)}`;
  };

  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0];
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

  const handleEdit = (subscription: UnifiedSubscription) => {
    if (subscription.type !== "manual") return;

    setSelectedSubscription(subscription);
    setEditForm({
      priceAmount: (subscription.priceAmount / 100).toString(),
      status: subscription.status,
      nextExpirationDate: formatDateForInput(subscription.nextExpirationDate),
    });
    onOpen();
  };

  const handleSaveEdit = async () => {
    if (
      !selectedSubscription ||
      selectedSubscription.type !== "manual" ||
      !selectedSubscription.businessId
    )
      return;

    try {
      const updateData = {
        priceAmount: parseFloat(editForm.priceAmount) * 100,
        status: editForm.status,
        nextExpirationDate: new Date(editForm.nextExpirationDate).toISOString(),
      };

      await updateSubscription(selectedSubscription.businessId, updateData);

      addToast({
        title: t("common.success"),
        description: "Subscription updated successfully",
        severity: "success",
        color: "success",
      });

      onClose();
      refetch();
    } catch (err) {
      addToast({
        title: t("common.error"),
        description: "Error updating subscription",
        severity: "danger",
        color: "danger",
      });
    }
  };

  const sortedSubscriptions = Array.isArray(subscriptions)
    ? subscriptions.sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.currentPeriodStart || 0,
        ).getTime();
        const dateB = new Date(
          b.createdAt || b.currentPeriodStart || 0,
        ).getTime();
        return dateB - dateA;
      })
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
          <Table aria-label="All subscriptions table">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>Type</TableColumn>
              <TableColumn>Business ID</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>Amount</TableColumn>
              <TableColumn>Next Expiration</TableColumn>
              <TableColumn>Sensors</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {sortedSubscriptions.map((subscription) => (
                <TableRow key={`${subscription.type}-${subscription.id}`}>
                  <TableCell>
                    {subscription.type === "manual"
                      ? subscription.id
                      : subscription.stripeSubscriptionId?.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getTypeColor(subscription.type)}
                      variant="flat"
                      size="sm"
                    >
                      {subscription.type.toUpperCase()}
                    </Chip>
                  </TableCell>
                  <TableCell>{subscription.businessId || "N/A"}</TableCell>
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
                  <TableCell>{subscription.sensorQty || "N/A"}</TableCell>
                  <TableCell>
                    {subscription.type === "manual" ? (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEdit(subscription)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-gray-400 text-sm">Read-only</span>
                    )}
                  </TableCell>
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

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader>Edit Manual Subscription</ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Price Amount (€)"
              type="number"
              step="0.01"
              value={editForm.priceAmount}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  priceAmount: e.target.value,
                }))
              }
            />

            <Select
              label="Status"
              selectedKeys={editForm.status ? [editForm.status] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                setEditForm((prev) => ({ ...prev, status: selectedKey }));
              }}
            >
              {editStatusOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>

            <Input
              label="Next Expiration Date"
              type="date"
              value={editForm.nextExpirationDate}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  nextExpirationDate: e.target.value,
                }))
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSaveEdit}
              isLoading={updateLoading}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SubscriptionEventsFeed;
