// src/components/dashboard/overview/card-grid.tsx
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { SensorDataCard } from "../charts/card";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@heroui/react";
import { EyeSlashIcon, EyeIcon, PencilIcon } from "@heroicons/react/24/outline";

interface MetricsCardGridProps {
  metrics: {
    totalIn: number;
    totalOut: number;
    dailyAverageIn: number;
    dailyAverageOut: number;
    mostCrowdedDay: { date: Date; value: number } | null;
    leastCrowdedDay: { date: Date; value: number } | null;
    entryRate: number;
    percentageChange: number;
  };
  dateRange: { start: Date; end: Date };
  sensorIdsList: string;
  getSensorDetails: () => any[];
}

interface CardConfig {
  id: string;
  title: string;
  translationKey: string;
  descriptionTranslationKey: string;
  value: string | number;
  unit: string;
  data: Record<string, any>;
  visible: boolean;
}

// Define sortable card component with edit mode awareness
const SortableCard = ({
  id,
  children,
  isEditing,
}: {
  id: string;
  children: React.ReactNode;
  isEditing: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Only apply drag attributes when in edit mode
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditing ? { ...attributes, ...listeners } : {})}
      className={isEditing ? "cursor-move" : ""}
    >
      {children}
    </div>
  );
};

export const MetricsCardGrid: React.FC<MetricsCardGridProps> = ({
  metrics,
  dateRange,
  sensorIdsList,
  getSensorDetails,
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  // Define initial card configurations
  const initialCardConfigs: CardConfig[] = [
    {
      id: "totalIn",
      title: "Total In",
      translationKey: "dashboard.metrics.totalIn",
      descriptionTranslationKey: "dashboard.metrics.totalInDescription",
      value: metrics.totalIn.toLocaleString(),
      unit: "people",
      data: {
        total_in: metrics.totalIn,
        date_range_start: format(dateRange.start, "yyyy-MM-dd"),
        date_range_end: format(dateRange.end, "yyyy-MM-dd"),
        sensors: sensorIdsList,
        sensorDetails: getSensorDetails(),
      },
      visible: true,
    },
    {
      id: "totalOut",
      title: "Total Out",
      translationKey: "dashboard.metrics.totalOut",
      descriptionTranslationKey: "dashboard.metrics.totalOutDescription",
      value: metrics.totalOut.toLocaleString(),
      unit: "people",
      data: {
        total_out: metrics.totalOut,
        date_range_start: format(dateRange.start, "yyyy-MM-dd"),
        date_range_end: format(dateRange.end, "yyyy-MM-dd"),
        sensors: sensorIdsList,
        sensorDetails: getSensorDetails(),
      },
      visible: true,
    },
    {
      id: "dailyAverageIn",
      title: "Daily Average In",
      translationKey: "dashboard.metrics.dailyAverageIn",
      descriptionTranslationKey: "dashboard.metrics.dailyAverageInDescription",
      value: metrics.dailyAverageIn.toLocaleString(),
      unit: "people/day",
      data: {
        daily_average_in: metrics.dailyAverageIn,
        date_range_start: format(dateRange.start, "yyyy-MM-dd"),
        date_range_end: format(dateRange.end, "yyyy-MM-dd"),
        sensors: sensorIdsList,
        sensorDetails: getSensorDetails(),
      },
      visible: true,
    },
    {
      id: "dailyAverageOut",
      title: "Daily Average Out",
      translationKey: "dashboard.metrics.dailyAverageOut",
      descriptionTranslationKey: "dashboard.metrics.dailyAverageOutDescription",
      value: metrics.dailyAverageOut.toLocaleString(),
      unit: "people/day",
      data: {
        daily_average_out: metrics.dailyAverageOut,
        date_range_start: format(dateRange.start, "yyyy-MM-dd"),
        date_range_end: format(dateRange.end, "yyyy-MM-dd"),
        sensors: sensorIdsList,
        sensorDetails: getSensorDetails(),
      },
      visible: true,
    },
    {
      id: "mostCrowdedDay",
      title: "Most Crowded Day",
      translationKey: "dashboard.metrics.mostCrowdedDay",
      descriptionTranslationKey: "dashboard.metrics.mostCrowdedDayDescription",
      value: metrics.mostCrowdedDay
        ? format(metrics.mostCrowdedDay.date, "d MMM")
        : "-",
      unit: metrics.mostCrowdedDay
        ? `(${metrics.mostCrowdedDay.value.toLocaleString()} people)`
        : "",
      data: {
        most_crowded_day: metrics.mostCrowdedDay
          ? format(metrics.mostCrowdedDay.date, "yyyy-MM-dd")
          : "-",
        most_crowded_value: metrics.mostCrowdedDay?.value || 0,
        date_range_start: format(dateRange.start, "yyyy-MM-dd"),
        date_range_end: format(dateRange.end, "yyyy-MM-dd"),
        sensors: sensorIdsList,
        sensorDetails: getSensorDetails(),
      },
      visible: true,
    },
    {
      id: "leastCrowdedDay",
      title: "Least Crowded Day",
      translationKey: "dashboard.metrics.leastCrowdedDay",
      descriptionTranslationKey: "dashboard.metrics.leastCrowdedDayDescription",
      value: metrics.leastCrowdedDay
        ? format(metrics.leastCrowdedDay.date, "d MMM")
        : "-",
      unit: metrics.leastCrowdedDay
        ? `(${metrics.leastCrowdedDay.value.toLocaleString()} people)`
        : "",
      data: {
        least_crowded_day: metrics.leastCrowdedDay
          ? format(metrics.leastCrowdedDay.date, "yyyy-MM-dd")
          : "-",
        least_crowded_value: metrics.leastCrowdedDay?.value || 0,
        date_range_start: format(dateRange.start, "yyyy-MM-dd"),
        date_range_end: format(dateRange.end, "yyyy-MM-dd"),
        sensors: sensorIdsList,
        sensorDetails: getSensorDetails(),
      },
      visible: true,
    },
    {
      id: "entryRate",
      title: "Entry Rate",
      translationKey: "dashboard.metrics.entryRate",
      descriptionTranslationKey: "dashboard.metrics.entryRateDescription",
      value: metrics.entryRate,
      unit: "%",
      data: {
        entry_rate: metrics.entryRate,
        date_range_start: format(dateRange.start, "yyyy-MM-dd"),
        date_range_end: format(dateRange.end, "yyyy-MM-dd"),
        sensors: sensorIdsList,
        sensorDetails: getSensorDetails(),
      },
      visible: true,
    },
    {
      id: "percentageChange",
      title: "Percentage Increase/Decrease",
      translationKey: "dashboard.metrics.percentageChange",
      descriptionTranslationKey:
        "dashboard.metrics.percentageChangeDescription",
      value:
        (metrics.percentageChange > 0 ? "+" : "") +
        metrics.percentageChange.toLocaleString(),
      unit: "%",
      data: {
        percentage_change: metrics.percentageChange,
        date_range_start: format(dateRange.start, "yyyy-MM-dd"),
        date_range_end: format(dateRange.end, "yyyy-MM-dd"),
        sensors: sensorIdsList,
        sensorDetails: getSensorDetails(),
      },
      visible: true,
    },
  ];

  // Set up sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Initialize cards order from localStorage or use default
  const [cards, setCards] = useState<CardConfig[]>(() => {
    const savedOrder = localStorage.getItem("overviewCardsOrder");
    if (savedOrder) {
      try {
        const savedCards = JSON.parse(savedOrder);
        // Update with fresh metrics data
        return initialCardConfigs.map((initialCard) => {
          const savedCard = savedCards.find(
            (s: CardConfig) => s.id === initialCard.id,
          );
          return savedCard
            ? {
                ...initialCard,
                visible:
                  savedCard.visible !== undefined ? savedCard.visible : true,
              }
            : initialCard;
        });
      } catch (e) {
        console.error("Error parsing saved card order", e);
        return initialCardConfigs;
      }
    }
    return initialCardConfigs;
  });

  // Save card order to localStorage when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem("overviewCardsOrder", JSON.stringify(cards));
    }
  }, [isEditing, cards]);

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Toggle card visibility
  const toggleCardVisibility = (cardId: string) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId ? { ...card, visible: !card.visible } : card,
      ),
    );
  };

  // Get visible cards
  const visibleCards = cards.filter((card) => card.visible);

  // Reset to default order
  const resetToDefault = () => {
    setCards(initialCardConfigs);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold"></h3>
        <div className="flex gap-2">
          {isEditing && (
            <Button
              variant="bordered"
              size="sm"
              onPress={resetToDefault}
              className="text-sm"
            >
              {t("dashboard.metrics.resetLayout")}
            </Button>
          )}
          <Button
            variant={isEditing ? "flat" : "solid"}
            color={isEditing ? "default" : "primary"}
            size="sm"
            startContent={<PencilIcon className="w-4 h-4" />}
            onPress={toggleEditMode}
            className="text-sm"
          >
            {isEditing
              ? t("dashboard.metrics.saveLayout")
              : t("dashboard.metrics.editLayout")}
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext
          items={visibleCards.map((card) => card.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleCards.map((card) => (
              <SortableCard key={card.id} id={card.id} isEditing={isEditing}>
                <div className="relative">
                  <SensorDataCard
                    title={card.title}
                    value={card.value}
                    unit={card.unit}
                    translationKey={card.translationKey}
                    descriptionTranslationKey={card.descriptionTranslationKey}
                    dateRange={dateRange}
                    data={card.data}
                    hideExport={isEditing} // Hide export button when in edit mode
                  />
                  {/* Show visibility toggle only in edit mode */}
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      isIconOnly
                      className="absolute top-2 right-2 z-10" // Now positioned in top-right since export is hidden
                      onPress={() => toggleCardVisibility(card.id)}
                      aria-label={card.visible ? "Hide card" : "Show card"}
                    >
                      <EyeSlashIcon className="w-3.5 h-3.5 text-gray-500" />
                    </Button>
                  )}
                </div>
              </SortableCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Hidden cards section - only visible in edit mode */}
      {isEditing && cards.some((card) => !card.visible) && (
        <div className="mt-8 border-t pt-4">
          <h4 className="text-md font-medium mb-3">
            {t("dashboard.metrics.hiddenCards")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {cards
              .filter((card) => !card.visible)
              .map((card) => (
                <Button
                  key={card.id}
                  size="sm"
                  variant="bordered"
                  className="flex items-center gap-1"
                  onPress={() => toggleCardVisibility(card.id)}
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                  <span>{t(card.translationKey)}</span>
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
