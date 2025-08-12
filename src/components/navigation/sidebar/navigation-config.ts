import {
  ChartBarIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  MapPinIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowsRightLeftIcon,
  BriefcaseIcon,
  DeviceTabletIcon,
} from "@heroicons/react/16/solid";

export const navItems = [
  { title: "overview", href: "/overview", icon: HomeIcon },
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
  { title: "overview", href: "/overview", icon: HomeIcon },
  { title: "dashboard", href: "/dashboard", icon: ChartBarIcon },
  { title: "comparison", href: "/comparison", icon: ArrowsRightLeftIcon },
  { title: "user-management", href: "/user-management", icon: UserGroupIcon },
  { title: "locations", href: "/locations", icon: MapPinIcon },
  { title: "help", href: "/help", icon: QuestionMarkCircleIcon },
];
