// src/components/dashboard/overview/card-grid.tsx
import React, { useState, useEffect, useMemo } from "react";
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
import { SensorDataCard } from "../charts/card";
import { createOverviewWidgetFactory } from "../layout-overview/widgets/widget-factory";
import { OverviewWidgetConfig } from "../layout-overview/widgets/types";

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

interface DisplayableWidgetConfig extends OverviewWidgetConfig {
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

  // Generate initial card configurations from the factory
  const initialCardConfigs = useMemo(() => {
    const widgetFactory = createOverviewWidgetFactory(
      { metrics, dateRange, sensorIdsList, getSensorDetails },
      t,
    );
    return Object.values(widgetFactory).map((widget) => ({
      ...widget,
      visible: true,
    }));
  }, [metrics, dateRange, sensorIdsList, getSensorDetails, t]);

  // Set up sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Initialize cards order from localStorage or use default
  const [cards, setCards] = useState<DisplayableWidgetConfig[]>(() => {
    const savedOrder = localStorage.getItem("overviewCardsOrder");
    if (savedOrder) {
      try {
        const savedCards: { id: string; visible: boolean }[] =
          JSON.parse(savedOrder);
        const savedCardMap = new Map(
          savedCards.map((c) => [c.id, { visible: c.visible }]),
        );

        // Create a new list based on the saved order
        const orderedCards = savedCards
          .map((savedCard) => {
            const fullCardData = initialCardConfigs.find(
              (c) => c.id === savedCard.id,
            );
            if (!fullCardData) return null; // Card might not exist anymore
            return {
              ...fullCardData,
              visible: savedCard.visible,
            };
          })
          .filter((c): c is DisplayableWidgetConfig => c !== null);

        // Add any new cards that weren't in the saved layout
        initialCardConfigs.forEach((initialCard) => {
          if (!savedCardMap.has(initialCard.id)) {
            orderedCards.push(initialCard);
          }
        });

        return orderedCards;
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
      const cardsToSave = cards.map(({ id, visible }) => ({ id, visible }));
      localStorage.setItem("overviewCardsOrder", JSON.stringify(cardsToSave));
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
