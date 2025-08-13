// src/components/dashboard/layout-overview/widgets/widget-config.tsx
import { OverviewWidgetConfig, OverviewWidgetFactoryParams } from "./types";
import { createOverviewWidgetFactory } from "./widget-factory";
import { TFunction } from "i18next";
import { SensorDataCard } from "../../charts/card";
import { WidgetConfig } from "../../layout-dashboard/widgets";

export const createOverviewWidgetConfig = (
  params: OverviewWidgetFactoryParams,
  t: TFunction,
): WidgetConfig[] => {
  const widgetDataFactory = createOverviewWidgetFactory(params, t);

  return Object.values(widgetDataFactory).map(
    (widget: OverviewWidgetConfig) => ({
      id: widget.id,
      type: widget.type,
      title: widget.title,
      category: widget.category,
      component: (
        <SensorDataCard
          title={widget.title}
          value={widget.value}
          unit={widget.unit}
          translationKey={widget.translationKey}
          descriptionTranslationKey={widget.descriptionTranslationKey}
          dateRange={{
            start: params.dateRange.start,
            end: params.dateRange.end,
          }}
          data={widget.data}
          comparison={widget.comparison}
          comparisonPeriod={widget.comparisonPeriod}
        />
      ),
    }),
  );
};
