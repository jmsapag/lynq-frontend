import {
  ChartBarIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowsRightLeftIcon,
  BriefcaseIcon,
  DeviceTabletIcon,
} from "@heroicons/react/16/solid";

export const navItems = [
  { title: "dashboard", href: "/dashboard", icon: ChartBarIcon },
  { title: "comparison", href: "/comparison", icon: ArrowsRightLeftIcon },
  { title: "help", href: "/help", icon: QuestionMarkCircleIcon },
];

export const superAdminNavItems = [
  { title: "businesses", href: "/businesses", icon: BriefcaseIcon },
  { title: "devices", href: "/devices", icon: DeviceTabletIcon },
  { title: "users", href: "/manage/users", icon: UserGroupIcon },
];

export const adminNavItems = [
  { title: "dashboard", href: "/dashboard", icon: ChartBarIcon },
  { title: "comparison", href: "/comparison", icon: ArrowsRightLeftIcon },
  { title: "user-management", href: "/user-management", icon: UserGroupIcon },
  { title: "help", href: "/help", icon: QuestionMarkCircleIcon },
];
