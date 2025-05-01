import React, { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import {
  ChartBarIcon,
  XMarkIcon,
  Bars3Icon,
  UserGroupIcon,
  ComputerDesktopIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import logoImage from "../../assets/logo.png";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { title: "dashboard", href: "/", icon: ChartBarIcon },
  { title: "users", href: "/users", icon: UserGroupIcon },
  { title: "devices", href: "/devices", icon: ComputerDesktopIcon },
];

interface NavLinkProps {
  item: NavItem;
  active: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ item, active }) => {
  const Icon = item.icon;
  const { t } = useTranslation();

  return (
    <Link
      to={item.href}
      className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-gray-200 text-gray-900"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={`h-5 w-5 ${
            active ? "text-gray-700" : "text-gray-500 group-hover:text-gray-700"
          }`}
        />
        <span>{t(`nav.${item.title}`)}</span>
      </div>
      {item.badge && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            active
              ? "bg-gray-300 text-gray-800"
              : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-800"
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
};

const SidebarContent: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const { i18n, t } = useTranslation();

  const handleLogout = () => {
    console.log("Logout action triggered!");
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "es" : "en");
  };

  return (
    <div className="flex h-full flex-col bg-white text-black">
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-200 px-4">
        <Link to="/" className="flex items-center">
          <img src={logoImage} alt="Company Logo" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4"></div>
          <nav className="grid gap-1 px-3 py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href}
              />
            ))}
          </nav>
        </div>

        <div className="border-t border-gray-200 p-2">
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="flex w-full items-center justify-between gap-3 rounded-md p-2 text-left hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700 shrink-0">
                    JD
                  </div>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      John Doe
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {t("role.admin")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={toggleLanguage}
                  title="Change language"
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <LanguageIcon className="h-5 w-5" />
                </button>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute bottom-full left-0 mb-2 w-full origin-bottom-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                      } group flex w-full items-center rounded-md px-3 py-2 text-sm`}
                    >
                      {t("logout")}
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};

interface SidebarWithStateProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const SidebarWithState: React.FC<SidebarWithStateProps> = ({
  isOpen,
  setIsOpen,
}) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-gray-200 bg-white p-0 transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 z-50 text-gray-500 hover:text-black"
          aria-label="Close sidebar"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <SidebarContent />
      </aside>

      <aside className="hidden border-r border-gray-200 bg-white md:flex md:w-72 md:flex-col">
        <SidebarContent />
      </aside>
    </>
  );
};

export const MobileSidebarToggle: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="rounded-md p-2 text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
      aria-label="Open sidebar"
    >
      <Bars3Icon className="h-6 w-6" />
    </button>
  );
};
