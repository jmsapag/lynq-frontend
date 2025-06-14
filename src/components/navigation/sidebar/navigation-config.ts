import {
  ChartBarIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowsRightLeftIcon,
  BuildingOfficeIcon,
  DeviceTabletIcon,
} from "@heroicons/react/16/solid";

export const navItems = [
  { title: "dashboard", href: "/dashboard", icon: ChartBarIcon },
  { title: "comparison", href: "/comparison", icon: ArrowsRightLeftIcon },
  { title: "users", href: "/users", icon: UserGroupIcon },
  { title: "help", href: "/help", icon: QuestionMarkCircleIcon },
];

export const superAdminNavItems = [
  { title: "businesses", href: "/businesses", icon: BuildingOfficeIcon },
  { title: "devices", href: "/devices", icon: DeviceTabletIcon },
  { title: "users", href: "/users", icon: UserGroupIcon },
];
