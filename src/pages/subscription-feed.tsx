// src/pages/subscription-feed.tsx
import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Select,
  SelectItem,
  DatePicker,
  Input,
  addToast,
} from "@heroui/react";
import { DateValue } from "@internationalized/date";
import { useTranslation } from "react-i18next";
import { useSubscriptionEvents } from "../hooks/payments/useSubscriptionEvents";
import { getUserRoleFromToken } from "../hooks/auth/useAuth.ts";
import EventSkeleton from "../components/payments/EventSkeleton.tsx";
import EventCard from "../components/payments/EventCard.tsx";
import SearchBar from "../components/search/SearchBar.tsx";

const SubscriptionEventsFeed = () => {
  const { t } = useTranslation();
  const userRole = getUserRoleFromToken();
  const isLynqTeam = userRole === "LYNQ_TEAM";

  const [filters, setFilters] = useState({
    companyId: "",
    type: "",
    from: "",
    to: "",
  });

  const [search, setSearch] = useState("");

  const { events, loading, error } = useSubscriptionEvents(filters);

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

  const eventTypes = [
    { key: "", label: t("subscriptions.events.allTypes") },
    {
      key: "subscription_created",
      label: t("subscriptions.events.subscriptionCreated"),
    },
    {
      key: "subscription_updated",
      label: t("subscriptions.events.subscriptionUpdated"),
    },
    {
      key: "subscription_cancelled",
      label: t("subscriptions.events.subscriptionCancelled"),
    },
    {
      key: "payment_successful",
      label: t("subscriptions.events.paymentSuccessful"),
    },
    { key: "payment_failed", label: t("subscriptions.events.paymentFailed") },
    { key: "invoice_created", label: t("subscriptions.events.invoiceCreated") },
    { key: "invoice_paid", label: t("subscriptions.events.invoicePaid") },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ companyId: "", type: "", from: "", to: "" });
    setSearch("");
  };

  const handleFromDateChange = (value: DateValue | null) => {
    const dateValue = value ? value.toString() : "";
    handleFilterChange("from", dateValue);
  };

  const handleToDateChange = (value: DateValue | null) => {
    const dateValue = value ? value.toString() : "";
    handleFilterChange("to", dateValue);
  };

  const filteredEvents = error
    ? []
    : Array.isArray(events)
      ? events
          .filter((event) => {
            const searchTerm = search.toLowerCase().trim();
            if (!searchTerm) return true;

            return (
              event.type.toLowerCase().includes(searchTerm) ||
              event.source.toLowerCase().includes(searchTerm) ||
              event.companyId.toLowerCase().includes(searchTerm) ||
              JSON.stringify(event.payload).toLowerCase().includes(searchTerm)
            );
          })
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
      : [];

  const hasActiveFilters =
    filters.companyId || filters.type || filters.from || filters.to;

  return (
    <div className="w-full mx-1">
      <div className="flex justify-end items-center mb-4 gap-4">
        {isLynqTeam && (
          <Input
            placeholder={t("subscriptions.events.companyIdFilter")}
            value={filters.companyId}
            onChange={(e) => handleFilterChange("companyId", e.target.value)}
            size="sm"
            className="w-48"
          />
        )}

        <Select
          placeholder={t("subscriptions.events.typeFilter")}
          selectedKeys={new Set(filters.type ? [filters.type] : [])}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0] as string;
            handleFilterChange("type", selectedKey || "");
          }}
          size="sm"
          className="w-48"
          items={eventTypes}
        >
          {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
        </Select>

        <DatePicker
          value={filters.from ? null : null}
          onChange={handleFromDateChange}
          size="sm"
          className="w-40"
        />

        <DatePicker
          value={filters.to ? null : null}
          onChange={handleToDateChange}
          size="sm"
          className="w-40"
        />

        {hasActiveFilters && (
          <Button size="sm" variant="bordered" onPress={clearFilters}>
            {t("subscriptions.events.clearFilters")}
          </Button>
        )}

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t("subscriptions.events.searchPlaceholder")}
          className="w-64"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <EventSkeleton key={index} />
          ))
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
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
    </div>
  );
};

export default SubscriptionEventsFeed;
