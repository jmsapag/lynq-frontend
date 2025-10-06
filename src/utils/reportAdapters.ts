import { Report, ReportLayoutConfiguration } from "../types/reports";

// Adapts layout configuration objects to a generic Report list item structure.
// Since backend does not supply createdAt/status/schedule we derive or leave placeholders.
export const adaptLayoutConfigToReport = (
  cfg: ReportLayoutConfiguration,
): Report => {
  return {
    id: cfg.layoutId,
    title: cfg.layoutId,
    createdAt: cfg.lastModified, // using lastModified as best available timestamp
    updatedAt: cfg.lastModified,
    status: undefined,
    schedule: undefined,
    variables: {
      version: cfg.version,
      widgets: Object.keys(cfg.widgetPlacements).length,
    },
  };
};

export const adaptSingleLayoutConfig = (
  cfg: ReportLayoutConfiguration | null,
): Report | null => (cfg ? adaptLayoutConfigToReport(cfg) : null);
