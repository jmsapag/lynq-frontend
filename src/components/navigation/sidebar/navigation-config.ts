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
  DeviceTabletIcon,
} from "@heroicons/react/16/solid";

export const navItems = [
  { title: "home", href: "/home", icon: HomeIcon },
  { title: "comparison", href: "/comparison", icon: ArrowsRightLeftIcon },
  { title: "reports", href: "/reports", icon: DocumentChartBarIcon },
  { title: "help", href: "/help", icon: QuestionMarkCircleIcon },
];

export const superAdminNavItems = [
  { title: "businesses", href: "/businesses", icon: BriefcaseIcon },
  { title: "devices", href: "/devices", icon: DeviceTabletIcon },
  { title: "users", href: "/manage/users", icon: UserGroupIcon },
];

export const adminNavItems = [
  { title: "home", href: "/home", icon: HomeIcon },
  { title: "comparison", href: "/comparison", icon: ArrowsRightLeftIcon },
  { title: "reports", href: "/reports", icon: DocumentChartBarIcon },
  { title: "user-management", href: "/user-management", icon: UserGroupIcon },
  { title: "locations", href: "/locations", icon: MapPinIcon },
  { title: "help", href: "/help", icon: QuestionMarkCircleIcon },
];
