import { TFunction } from "i18next";

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  offset?: { x: number; y: number };
}

export const getDashboardTourSteps = (t: TFunction): TourStep[] => [
  {
    target: '[data-tour="dashboard-title"]',
    title: "tour.dashboard.welcome.title",
    content: "tour.dashboard.welcome.content",
    placement: "bottom",
  },
  {
    target: '[data-tour="filters"]',
    title: "tour.dashboard.filters.title",
    content: "tour.dashboard.filters.content",
    placement: "bottom",
  },
  {
    target: '[data-tour="metrics-overview"]',
    title: "tour.dashboard.metrics.title",
    content: "tour.dashboard.metrics.content",
    placement: "bottom",
  },
  {
    target: '[data-tour="chart-widgets"]',
    title: "tour.dashboard.charts.title",
    content: "tour.dashboard.charts.content",
    placement: "bottom",
  },
  {
    target: '[data-tour="edit-mode"]',
    title: "tour.dashboard.editLayout.title",
    content: "tour.dashboard.editLayout.content",
    placement: "left",
  },
  {
    target: '[data-tour="layout-selector"]',
    title: "tour.dashboard.layoutSelector.title",
    content: "tour.dashboard.layoutSelector.content",
    placement: "bottom",
  },
];

export const getSidebarTourSteps = (t: TFunction): TourStep[] => [
  {
    target: '[data-tour="sidebar-menu"]',
    title: "tour.sidebar.welcome.title",
    content: "tour.sidebar.welcome.content",
    placement: "right",
  },
  {
    target: '[data-tour="sidebar-logo"]',
    title: "tour.sidebar.logo.title",
    content: "tour.sidebar.logo.content",
    placement: "right",
  },
  {
    target: '[data-tour="sidebar-collapse"]',
    title: "tour.sidebar.collapse.title",
    content: "tour.sidebar.collapse.content",
    placement: "right",
  },
  {
    target: '[data-tour="sidebar-navigation"]',
    title: "tour.sidebar.navigation.title",
    content: "tour.sidebar.navigation.content",
    placement: "right",
  },
  {
    target: '[data-tour="sidebar-profile"]',
    title: "tour.sidebar.profile.title",
    content: "tour.sidebar.profile.content",
    placement: "right",
  },
];

export const getFullAppTourSteps = (t: TFunction): TourStep[] => [
  ...getSidebarTourSteps(t),
  ...getDashboardTourSteps(t),
];
