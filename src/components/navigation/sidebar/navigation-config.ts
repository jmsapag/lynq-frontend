import {
  ChartBarIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { ArrowsRightLeftIcon } from "@heroicons/react/16/solid";

export const navItems = [
  { title: "dashboard", href: "/", icon: ChartBarIcon },
  { title: "comparison", href: "/comparison", icon: ArrowsRightLeftIcon },
  { title: "users", href: "/users", icon: UserGroupIcon },
  { title: "devices", href: "/devices", icon: ComputerDesktopIcon },
  { title: "help", href: "/help", icon: QuestionMarkCircleIcon },
];
