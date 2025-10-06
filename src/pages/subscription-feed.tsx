import React, { useState, useEffect } from "react";
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
  useCreateManualSubscription,
  UnifiedSubscription,
} from "../hooks/payments/useSubscriptionEvents";
import { getUserRoleFromToken } from "../hooks/auth/useAuth.ts";
import { useBusinesses } from "../hooks/business/useBusiness";
import { downloadInvoice } from "../services/subscriptionService";
import {
  PencilIcon,
  PlusIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

const SubscriptionEventsFeed = () => {
  const { t } = useTranslation();
  const userRole = getUserRoleFromToken();
  const isLynqTeam = userRole === "LYNQ_TEAM";
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [filters, setFilters] = useState({
    businessName: "",
    status: "",
  });

  const [selectedSubscription, setSelectedSubscription] =
    useState<UnifiedSubscription | null>(null);
  const [editForm, setEditForm] = useState({
    priceAmount: "",
    status: "",
    nextExpirationDate: "",
  });
  const [createForm, setCreateForm] = useState({
    businessId: 0,
    priceAmount: "",
    status: "pending",
    nextExpirationDate: "",
  });
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [downloadingInvoice, setDownloadingInvoice] = useState<Set<number>>(
    new Set(),
  );

  const {
    subscriptions,
    loading: subscriptionsLoading,
    error,
    refetch,
  } = useAllSubscriptions(filters);
  const { updateSubscription, loading: updateLoading } =
    useUpdateManualSubscription();
  const { createSubscription, loading: createLoading } =
    useCreateManualSubscription();
  const { businesses: allBusinesses, loading: businessesLoading } =
    useBusinesses(1, 1000);

  // Combined loading state - wait for both requests
  const loading = subscriptionsLoading || businessesLoading;

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
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeZone: "UTC",
    }).format(date);
  };

  const formatAmount = (amountCents: number) => {
    return `€${(amountCents / 100).toFixed(2)}`;
  };

  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().split("T")[0];
  };

  const formatStatus = (status: string) => {
    if (!status) return "N/A";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const toggleExpandedRow = (rowId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const handleDownloadInvoice = async (
    businessId: number,
    fileName: string,
  ) => {
    try {
      setDownloadingInvoice((prev) => new Set(prev).add(businessId));

      const blob = await downloadInvoice(businessId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      addToast({
        title: t("common.success"),
        description: "Invoice downloaded successfully",
        severity: "success",
        color: "success",
      });
    } catch (err) {
      addToast({
        title: t("common.error"),
        description: "Error downloading invoice",
        severity: "danger",
        color: "danger",
      });
    } finally {
      setDownloadingInvoice((prev) => {
        const newSet = new Set(prev);
        newSet.delete(businessId);
        return newSet;
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ businessName: "", status: "" });
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

  const handleCreate = (businessId: number) => {
    setCreateForm({
      businessId,
      priceAmount: "",
      status: "pending",
      nextExpirationDate: "",
    });
    onCreateOpen();
  };

  const handleSaveCreate = async () => {
    if (!createForm.businessId || !createForm.priceAmount || !createForm.status)
      return;

    try {
      const createData = {
        businessId: createForm.businessId,
        priceAmount: parseFloat(createForm.priceAmount) * 100, // Convert to cents
        status: createForm.status,
        nextExpirationDate: createForm.nextExpirationDate
          ? new Date(createForm.nextExpirationDate).toISOString()
          : undefined,
      };

      await createSubscription(createData);

      addToast({
        title: t("common.success"),
        description: "Subscription created successfully",
        severity: "success",
        color: "success",
      });

      onCreateClose();
      refetch();
    } catch (err) {
      addToast({
        title: t("common.error"),
        description: "Error creating subscription",
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

  // Get businesses without subscriptions - only filter when both requests are complete
  const businessesWithoutSubscriptions = React.useMemo(() => {
    // Don't filter if still loading or data not ready
    if (
      loading ||
      !Array.isArray(allBusinesses) ||
      !Array.isArray(subscriptions)
    ) {
      return [];
    }

    // Filter businesses that don't have any subscription
    return allBusinesses.filter((business) => {
      // Check if this business has any subscription (manual or stripe)
      const hasSubscription = subscriptions.some((sub) => {
        return sub.businessId === business.id;
      });
      return !hasSubscription;
    });
  }, [loading, allBusinesses, subscriptions]);

  const hasActiveFilters =
    (filters.businessName && filters.businessName !== "") ||
    (filters.status && filters.status !== "");

  return (
    <div className="w-full mx-1">
      <div className="flex justify-end items-center mb-4 gap-4">
        {isLynqTeam && (
          <Input
            placeholder="Filter by Business Name"
            value={filters.businessName}
            onChange={(e) => handleFilterChange("businessName", e.target.value)}
            size="sm"
            className="w-48"
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
        ) : sortedSubscriptions.length > 0 ||
          businessesWithoutSubscriptions.length > 0 ? (
          <Table aria-label="All subscriptions table">
            <TableHeader>
              <TableColumn>Business Name</TableColumn>
              <TableColumn>Type</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>Amount</TableColumn>
              <TableColumn>Next Expiration</TableColumn>
              <TableColumn>Sensors</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {sortedSubscriptions.map((subscription) => {
                const rowId = `${subscription.type}-${subscription.id}`;
                const isExpanded = expandedRows.has(rowId);
                const hasInvoice =
                  subscription.type === "manual" &&
                  subscription.invoiceFileName;

                return (
                  <React.Fragment key={rowId}>
                    <TableRow>
                      <TableCell>
                        {subscription.businessName || "N/A"}
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
                      <TableCell>
                        <Chip
                          color={getStatusColor(subscription.status)}
                          variant="flat"
                          size="sm"
                        >
                          {formatStatus(subscription.status)}
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
                        <div className="flex items-center gap-2">
                          {subscription.type === "manual" ? (
                            <>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => handleEdit(subscription)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              {hasInvoice && (
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  onPress={() => toggleExpandedRow(rowId)}
                                  title={
                                    isExpanded
                                      ? "Hide invoice details"
                                      : "Show invoice details"
                                  }
                                >
                                  <DocumentTextIcon className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Read-only
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {hasInvoice && isExpanded && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-gray-50">
                          <div className="p-4">
                            <div className="flex justify-between items-center gap-4">
                              <div className="flex-1">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">
                                    File Name
                                  </label>
                                  <p className="text-sm text-gray-900 break-all">
                                    {subscription.invoiceFileName}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600 pr-7">
                                    Uploaded Date
                                  </label>
                                  <p className="text-sm text-gray-900">
                                    {formatDate(subscription.invoiceUploadedAt)}
                                  </p>
                                </div>
                                <Button
                                  color="primary"
                                  variant="flat"
                                  size="sm"
                                  startContent={
                                    <DocumentArrowDownIcon className="h-4 w-4" />
                                  }
                                  isLoading={downloadingInvoice.has(
                                    subscription.businessId || 0,
                                  )}
                                  onPress={() =>
                                    subscription.businessId &&
                                    subscription.invoiceFileName &&
                                    handleDownloadInvoice(
                                      subscription.businessId,
                                      subscription.invoiceFileName,
                                    )
                                  }
                                >
                                  Download Invoice
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
              {businessesWithoutSubscriptions.map((business) => (
                <TableRow key={`no-subscription-${business.id}`}>
                  <TableCell>{business.name}</TableCell>
                  <TableCell>
                    <Chip color="default" variant="flat" size="sm">
                      NO SUBSCRIPTION
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip color="default" variant="flat" size="sm">
                      N/A
                    </Chip>
                  </TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>
                    <Button
                      isIconOnly
                      size="sm"
                      color="primary"
                      variant="light"
                      onPress={() => handleCreate(business.id)}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
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

      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="md">
        <ModalContent>
          <ModalHeader>Create Manual Subscription</ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Price Amount (€)"
              type="number"
              step="0.01"
              value={createForm.priceAmount}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  priceAmount: e.target.value,
                }))
              }
            />

            <Select
              label="Status"
              selectedKeys={createForm.status ? [createForm.status] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                setCreateForm((prev) => ({ ...prev, status: selectedKey }));
              }}
            >
              {editStatusOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>

            <Input
              label="Next Expiration Date"
              type="date"
              value={createForm.nextExpirationDate}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  nextExpirationDate: e.target.value,
                }))
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCreateClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSaveCreate}
              isLoading={createLoading}
            >
              Create Subscription
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SubscriptionEventsFeed;
