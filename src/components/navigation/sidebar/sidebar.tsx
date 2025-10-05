import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  XMarkIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import {
  navItems,
  superAdminNavItems,
  adminNavItems,
} from "./navigation-config.ts";
import { NavItem } from "./nav-item.tsx";
import { ProfileMenu } from "./profile-menu.tsx";
import logoImage from "../../../assets/logo.png";
import Cookies from "js-cookie";
import { useSelfUserProfile } from "../../../hooks/users/useSelfUserProfile";
import { useBillingBlock } from "../../../hooks/payments/useBillingBlock";
import { clearBillingBlock } from "../../../stores/billingBlockStore";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

interface SidebarProps {
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed = false,
  onClose,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const { user, loading } = useSelfUserProfile();
  const { blocked } = useBillingBlock();

  const availableNavItems = useMemo(() => {
    if (!user) {
      return [] as typeof navItems;
    }

    if (blocked) {
      if (user.role === "LYNQ_TEAM") {
        return [] as typeof navItems;
      }

      return [
        {
          title: "billing",
          href: "/billing/subscription",
          icon: CurrencyDollarIcon,
        },
      ];
    }

    if (user.role === "LYNQ_TEAM") {
      return superAdminNavItems;
    }

    if (user.role === "ADMIN") {
      return adminNavItems;
    }

    return navItems;
  }, [user, blocked]);

  const handleLogout = () => {
    // Clear billing block state on logout
    clearBillingBlock();
    // Clear both access token and refresh token
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    navigate("/login", { replace: true });
  };

  const sidebarWidth = isCollapsed ? "w-16" : "w-72";

  const SidebarContent = () => (
    <div
      className="flex h-full flex-col bg-white text-black"
      data-tour="sidebar-menu"
    >
      <div
        className={`flex h-16 shrink-0 items-center border-b border-gray-200 relative ${
          isCollapsed ? "justify-center px-2" : "justify-center px-4"
        }`}
      >
        <Link to="/home" className="flex items-center">
          <img
            src={logoImage}
            alt="Company Logo"
            className={isCollapsed ? "h-8 w-8 object-contain" : "h-10 w-auto"}
          />
        </Link>
        {onToggleCollapse && !isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors absolute right-2"
            aria-label="Collapse sidebar"
          >
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed - positioned below header */}
      {onToggleCollapse && isCollapsed && (
        <div className="hidden md:flex justify-center py-2 border-b border-gray-200">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronDoubleRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {loading || !user ? (
            <div className="text-xs text-gray-400 px-2 py-3"></div>
          ) : (
            <nav className={`grid gap-1 py-2 ${isCollapsed ? "px-2" : "px-3"}`}>
              {availableNavItems.map((item) => (
                <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
              ))}
            </nav>
          )}
        </div>
        <div
          className={`border-t border-gray-200 ${isCollapsed ? "p-1" : "p-2"}`}
        >
          <ProfileMenu
            user={{
              name: user?.name || "—",
              role: user?.role || "—",
            }}
            onLogout={handleLogout}
            isCollapsed={isCollapsed}
          />
        </div>
      </div>
    </div>
  );

  if (isOpen === undefined || !onClose) {
    return (
      <aside
        className={`hidden border-r border-gray-200 bg-white md:flex md:flex-col transition-all duration-300 ${sidebarWidth}`}
      >
        <SidebarContent />
      </aside>
    );
  }

  return (
    <div className="flex h-full">
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-gray-200 bg-white p-0 transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-50 text-gray-500 hover:text-black"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
        <SidebarContent />
      </aside>

      <aside
        className={`hidden border-r border-gray-200 bg-white md:flex md:flex-col transition-all duration-300 ${sidebarWidth}`}
      >
        <SidebarContent />
      </aside>
    </div>
  );
};
