import {
  ChartBarIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  MapPinIcon,
  HomeIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowsRightLeftIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  DeviceTabletIcon,
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
  { title: "subscriptions", href: "/subscriptions", icon: CurrencyDollarIcon },
];

export const adminNavItems = [
  // { title: "overview", href: "/overview", icon: HomeIcon },
  { title: "dashboard", href: "/dashboard", icon: ChartBarIcon },
  { title: "comparison", href: "/comparison", icon: ArrowsRightLeftIcon },
  { title: "reports", href: "/reports", icon: DocumentChartBarIcon },
  { title: "user-management", href: "/user-management", icon: UserGroupIcon },
  { title: "locations", href: "/locations", icon: MapPinIcon },
  { title: "subscriptions", href: "/subscriptions", icon: CurrencyDollarIcon },
  { title: "help", href: "/help", icon: QuestionMarkCircleIcon },
];
