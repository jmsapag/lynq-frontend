import {
  ChartBarIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  MapPinIcon,
  HomeIcon,
  DocumentChartBarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowsRightLeftIcon,
  BriefcaseIcon,
  // ClipboardDocumentListIcon,
  // CurrencyDollarIcon,
  DeviceTabletIcon,
  SparklesIcon,
} from "@heroicons/react/16/solid";

export const navItems = [
  { title: "overview", href: "/overview", icon: HomeIcon },
  { title: "dashboard", href: "/dashboard", icon: ChartBarIcon },
  { title: "comparison", href: "/comparison", icon: ArrowsRightLeftIcon },
  { title: "reports", href: "/reports", icon: DocumentChartBarIcon },
  { title: "help", href: "/help", icon: QuestionMarkCircleIcon },
];

export const superAdminNavItems = [
  { title: "businesses", href: "/businesses", icon: BriefcaseIcon },
  { title: "devices", href: "/devices", icon: DeviceTabletIcon },
  { title: "users", href: "/manage/users", icon: UserGroupIcon },
  // { title: "plans", href: "/plans", icon: ClipboardDocumentListIcon },
  { title: "subscriptions", href: "/subscriptions", icon: CurrencyDollarIcon },
];

export const adminNavItems = [
  // { title: "overview", href: "/overview", icon: HomeIcon },
  { title: "dashboard", href: "/dashboard", icon: ChartBarIcon },
  { title: "comparison", href: "/comparison", icon: ArrowsRightLeftIcon },
  { title: "reports", href: "/reports", icon: DocumentChartBarIcon },
  { title: "devices", href: "/devices", icon: DeviceTabletIcon },
  { title: "billing", href: "/billing", icon: CurrencyDollarIcon },
  { title: "user-management", href: "/user-management", icon: UserGroupIcon },
  { title: "locations", href: "/locations", icon: MapPinIcon },
  // { title: "subscriptions", href: "/subscriptions", icon: CurrencyDollarIcon },
  { title: "ai", href: "/ai", icon: SparklesIcon },
  { title: "help", href: "/help", icon: QuestionMarkCircleIcon },
];
